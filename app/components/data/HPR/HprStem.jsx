
import { ArrowUpRight } from 'lucide-react';

function StemPopup({ stemKey, stemInfo, onOpen }) {
  return (
    <div className='' style={{ padding: "8px 8px", width: "auto", borderRadius: "0" }}>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex flex-col ">
            <h1 className="text-sm">
              <strong>Stem Number</strong>
            </h1>
            <span className="text-5xl font-bold">{stemInfo.StemNumber}</span>
            <h3 className="text-xs text-gray-400">Species Group: <strong className="text-gray-600">{stemInfo.SpeciesGroupKey == 614 && (
              <span className="">Spruce</span>
            )}</strong></h3>
          </div>
        </div>
        <ArrowUpRight

          className="cursor-pointer p-1 bg-black text-white w-[35px] h-auto border-0 rounded-full hover:bg-gray-500"
          onClick={() => onOpen(stemKey, stemInfo)}
        />
      </div>
    </div>
  );
}

export default StemPopup;


