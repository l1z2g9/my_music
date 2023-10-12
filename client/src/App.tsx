import { useEffect, useState } from 'react';
import { AudioTrack } from './AudioTrack';
import './pure-min.css';
// import { liangjieeList, panChaoQiangList, rthkList, tanhuiqingList, yanjianrongList, ycanList, yePeiList, zhaobinghengList, zhongfeiList, zhouYongJieList } from './data.ts';

/* type Pair<T, K> = [T, K];
type Pairs<T, K> = Pair<T, K>[] */

type TrackList = {
  cat: string;
  subCat: string;
  playlist: Track[];
}

export type Track = {
  name: string,
  id: string
}

const App = () => {
  // const catList: Record<string, string> = { 'ycanList': '唐詩七絕選賞 - 陳耀南教授主講' };
  /* const audioList: AudioList = {
    '唐詩七絕選賞 - 陳耀南教授主講': ycanList, '葉培': yePeiList, '潘昭強': panChaoQiangList, '周永傑': zhouYongJieList,
    '招秉恒': zhaobinghengList, '梁潔娥': liangjieeList, '譚惠清': tanhuiqingList, '鍾飛': zhongfeiList, '嚴劍蓉': yanjianrongList, 'RTHK': rthkList
  }; */

  const [trackList, setTrackList] = useState<TrackList>();

  useEffect(() => {
    fetch("/api/category/ycanList").then(response =>
      response.json()
    ).then(list => {
      setTrackList({ cat: '粵講越有趣', subCat: '唐詩七絕選賞 - 陳耀南教授主講', playlist: list });
    })
  }, []);

  const onChange = (e: any) => {
    e.preventDefault();
    const cat = e.target.dataset.cat;
    const subCat = e.target.dataset.subcat as string;
    const playlist = e.target.dataset.playlist as string;

    fetch(`/api/category/${playlist}`).then(response =>
      response.json()
    ).then(list => {
      setTrackList({ cat, subCat, playlist: list });
    })
  }

  return (
    <div>
      <div className="pure-menu pure-menu-horizontal">
        <ul className="pure-menu-list">
          <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="粵講越有趣" data-subcat="唐詩七絕選賞 - 陳耀南教授主講" data-playlist="ycanList" className="pure-menu-link">粵講越有趣</a></li>
          <li className="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
            <a href="#" id="menuLink1" className="pure-menu-link">大城小事</a>
            <ul className="pure-menu-children">
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="葉培" data-playlist="yePeiList" className="pure-menu-link">葉培</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="潘昭強" className="pure-menu-link">潘昭強</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="周永傑" className="pure-menu-link">周永傑</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="招秉恒" className="pure-menu-link">招秉恒</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="梁潔娥" className="pure-menu-link">梁潔娥</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="譚惠清" className="pure-menu-link">譚惠清</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="鍾飛" className="pure-menu-link">鍾飛</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="嚴劍蓉" className="pure-menu-link">嚴劍蓉</a></li>
            </ul>
          </li>
          <li className="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
            <a href="#" id="menuLink2" className="pure-menu-link">Live Radio</a>
            <ul className="pure-menu-children">
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="LiveRadio" data-subcat="RTHK" data-playlist="rthkList" className="pure-menu-link">RTHK Live Radio</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="LiveRadio" data-subcat="Radio Fo Shan" data-playlist="foshanList" className="pure-menu-link">Fo Shan Live Radio</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="LiveRadio" data-subcat="Radio Guang Dong" data-playlist="guangdongList" className="pure-menu-link">Guang Dong Live Radio</a></li>
            </ul>
          </li>
        </ul>
      </div>
      <h1>{trackList?.cat}</h1>
      <h2>{trackList?.subCat}</h2>

      <AudioTrack list={trackList?.playlist} />
    </div>
  )
}

export default App;
