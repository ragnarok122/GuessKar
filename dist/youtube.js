// Official IFrame API control only. No stream extraction or hidden player.
export class YouTubeSnippetController {
  constructor(player,{onFinish=()=>{},onStatus=()=>{},now=()=>performance.now(),interval=setInterval,clear=clearInterval}={}) {
    Object.assign(this,{player,onFinish,onStatus,now,interval,clear});this.active=null;this.timer=null;
  }
  play({videoId,start,duration}) {
    if(!videoId||!Number.isFinite(start)||start<0||!Number.isFinite(duration)||duration<=0)throw Error('Invalid YouTube snippet.');
    this.cancel();const request={videoId,start,end:start+duration,duration,requestedAt:this.now(),playingSince:null,playedMs:0,started:false,progressed:false,lastProgressAt:this.now(),lastTime:start};this.active=request;
    // Install the watchdog BEFORE asking YouTube to play; do not rely on one state event.
    this.timer=this.interval(()=>this.tick(),20);
    this.onStatus('buffering');
    try{this.player.loadVideoById({videoId,startSeconds:start,endSeconds:start+duration});}catch(error){this.finish('error',error);}
  }
  state(state){const r=this.active;if(!r)return;
    if(state===1){if(r.playingSince===null)r.playingSince=this.now();r.started=true;this.onStatus('playing');}
    else {if(r.playingSince!==null){r.playedMs+=this.now()-r.playingSince;r.playingSince=null;}if(state===3)this.onStatus('buffering');if(state===2&&r.started)this.finish('paused');if(state===0&&r.started)this.finish('complete');}
  }
  tick(){const r=this.active;if(!r)return;
    try{
      const state=this.player.getPlayerState(),time=this.player.getCurrentTime();
      // Polling recovers missing/delayed PLAYING events, including the first click.
      if(state===1&&r.playingSince===null)this.state(1);
      if(state!==1&&r.playingSince!==null){r.playedMs+=this.now()-r.playingSince;r.playingSince=null;}
      if(r.started&&Number.isFinite(time)&&time>r.start+.001)r.progressed=true;
      if(Number.isFinite(time)&&time!==r.lastTime){r.lastTime=time;r.lastProgressAt=this.now();}
      if(r.started&&Number.isFinite(time)&&time>=r.end){this.finish('complete');return;}
      const elapsed=r.playedMs+(r.playingSince===null?0:this.now()-r.playingSince);
      // Media-time updates can be coarse or stuck. Bound actual PLAYING wall time as a fallback.
      if(elapsed>=r.duration*1000+250){this.finish('fallback');return;}
      if((!r.started&&this.now()-r.requestedAt>=20000)||(state===3&&this.now()-r.lastProgressAt>=20000))this.finish('timeout');
    }catch(error){this.finish('error',error);}
  }
  blocked(){this.finish('blocked');}
  finish(reason,error){const r=this.active;if(!r)return;this.active=null;this.clear(this.timer);this.timer=null;
    try{this.player.pauseVideo();}catch{}
    this.onFinish({reason,error,heard:r.progressed||((reason==='complete'||reason==='fallback')&&r.started)});
  }
  cancel(){this.active=null;if(this.timer!==null)this.clear(this.timer);this.timer=null;try{this.player.pauseVideo();}catch{}}
}
export function youtubePlaylistId(value){
  value=value.trim();let id=value;
  if(/^https?:/i.test(value)){let u;try{u=new URL(value);}catch{throw Error('Enter a valid YouTube playlist URL.');}
    if(!['youtube.com','www.youtube.com','music.youtube.com','m.youtube.com','youtu.be','www.youtu.be'].includes(u.hostname.toLowerCase()))throw Error('Use a youtube.com playlist URL or a playlist ID.');
    id=u.searchParams.get('list')||'';
  }
  if(!/^[A-Za-z0-9_-]{10,}$/.test(id))throw Error('Enter a valid public YouTube playlist URL or ID.');return id;
}
export function youtubeDuration(value){const m=/^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/.exec(value||'');return m?(+m[1]||0)*86400+(+m[2]||0)*3600+(+m[3]||0)*60+(+m[4]||0):0;}
export function youtubeLabels(title,channel){
  // Strip only presentation suffixes, preserving meaningful version names.
  title=title.replace(/\s*[\[(](?:official(?:\s+(?:music\s+video|audio|video|lyric\s+video))?|lyrics?|lyric\s+video|visuali[sz]er)[\])]\s*$/i,'').trim();
  let artist=channel?.replace(/ - Topic$/,'').trim()||'Unknown artist';const at=title.indexOf(' - ');if(at>0){artist=title.slice(0,at).trim();title=title.slice(at+3).trim();}return{title,artist};
}
export async function fetchYouTubePlaylist(value,key,{fetcher=fetch,idFactory=()=>crypto.randomUUID()}={}){
  const playlistId=youtubePlaylistId(value);const candidates=[];let next='';const pages=new Set();let skipped=0;
  async function request(resource,params){let response;try{response=await fetcher('https://www.googleapis.com/youtube/v3/'+resource+'?'+new URLSearchParams({...params,key}),{signal:AbortSignal.timeout(20000)});}catch{throw Error('YouTube could not be reached. Check your connection and try again.');}const data=await response.json();if(!response.ok)throw Error(data.error?.message||'YouTube import failed. Check your API key and playlist visibility.');return data;}
  do{if(pages.has(next))throw Error('YouTube returned a repeated page. Please retry the import.');pages.add(next);
    const data=await request('playlistItems',{part:'snippet,contentDetails',maxResults:'50',playlistId,...(next?{pageToken:next}:{})});
    for(const item of data.items||[]){const s=item.snippet,id=item.contentDetails?.videoId;if(!id||!s||['Deleted video','Private video'].includes(s.title)){skipped++;continue;}candidates.push({id,channel:s.videoOwnerChannelTitle||s.channelTitle,title:s.title});}
    next=data.nextPageToken||'';if(candidates.length>2000||(candidates.length===2000&&next))throw Error('This playlist exceeds 2,000 tracks. Import a smaller playlist.');
  }while(next);
  const unique=[...new Map(candidates.map(t=>[t.id,t])).values()];skipped+=candidates.length-unique.length;const tracks=[];
  for(let i=0;i<unique.length;i+=50){const batch=unique.slice(i,i+50),data=await request('videos',{part:'contentDetails,status,snippet',id:batch.map(t=>t.id).join(',')});const details=new Map((data.items||[]).map(t=>[t.id,t]));
    for(const item of batch){const d=details.get(item.id),duration=youtubeDuration(d?.contentDetails?.duration);
      if(!d||d.status?.embeddable===false||d.status?.privacyStatus==='private'||['live','upcoming'].includes(d.snippet?.liveBroadcastContent)||duration<=0){skipped++;continue;}
      tracks.push({id:idFactory(),...youtubeLabels(d.snippet?.title||item.title,d.snippet?.channelTitle||item.channel),videoId:item.id,source:'youtube',duration});
    }
  }
  return{tracks,skipped,playlistId};
}
