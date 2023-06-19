import { useEffect, useState } from 'react';
import './pure-min.css'
import { AudioTrack } from './AudioTrack';
import { liangjieeList, panChaoQiangList, rthkList, tanhuiqingList, yanjianrongList, ycanList, yePeiList, zhaobinghengList, zhongfeiList, zhouYongJieList } from './data.ts';

/* type Pair<T, K> = [T, K];
type Pairs<T, K> = Pair<T, K>[] */

type TrackList = {
  cat: string;
  subCat: string;
  playlist: string[][];
}

type AudioList = Record<string, string[][]>;

function App() {
  const audioList: AudioList = {
    '唐詩七絕選賞 - 陳耀南教授主講': ycanList, '葉培': yePeiList, '潘昭強': panChaoQiangList, '周永傑': zhouYongJieList,
    '招秉恒': zhaobinghengList, '梁潔娥': liangjieeList, '譚惠清': tanhuiqingList, '鍾飛': zhongfeiList, '嚴劍蓉': yanjianrongList, 'RTHK': rthkList
  };

  const [trackList, setTrackList] = useState<TrackList>();

  useEffect(() => {
    setTrackList({ cat: '粵講越有趣', subCat: '唐詩七絕選賞 - 陳耀南教授主講', playlist: ycanList });
  }, []);

  const onChange = (e: any) => {
    //e.preventDefault();
    let cat = e.target.dataset.cat;
    let subCat = e.target.dataset.subcat as string;
    let playlist = audioList[subCat];

    setTrackList({ cat, subCat, playlist })
  }

  return (
    <div>
      <div className="pure-menu pure-menu-horizontal">
        <ul className="pure-menu-list">
          <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="粵講越有趣" data-subcat="唐詩七絕選賞 - 陳耀南教授主講" className="pure-menu-link">粵講越有趣</a></li>
          <li className="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
            <a href="#" id="menuLink1" className="pure-menu-link">大城小事</a>
            <ul className="pure-menu-children">
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="葉培" className="pure-menu-link">葉培</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="潘昭強" className="pure-menu-link">潘昭強</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="周永傑" className="pure-menu-link">周永傑</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="招秉恒" className="pure-menu-link">招秉恒</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="梁潔娥" className="pure-menu-link">梁潔娥</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="譚惠清" className="pure-menu-link">譚惠清</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="鍾飛" className="pure-menu-link">鍾飛</a></li>
              <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="大城小事" data-subcat="嚴劍蓉" className="pure-menu-link">嚴劍蓉</a></li>
            </ul>
          </li>
          <li className="pure-menu-item"><a href="#" onClick={onChange} data-cat="LiveRadio" data-subcat="RTHK" className="pure-menu-link">RTHK Live Radio</a></li>
        </ul>
      </div>
      <h1>{trackList?.cat}</h1>
      <h2>{trackList?.subCat}</h2>

      <AudioTrack list={trackList?.playlist} />
    </div>
  )
}

export default App;
