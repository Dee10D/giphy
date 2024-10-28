import { useState } from "react";
import { HiMiniXMark, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const GifSearch = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const searchGIFs = async () => {
    if (query.trim() === "") {
      return;
    }

    navigate(`/search/${query}`);
  };

  return (
    <div className="flex relative search-wrap">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search all the GIFs and Stickers"
        className="w-full pl-2 pr-8 py-3 text-lg text-black rounded-tl rounded-bl border border-gray-300 outline-none"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute bg-gray-300 opacity-90 rounded-full right-16 mr-2 top-3"
        >
          <HiMiniXMark size={18} />
        </button>
      )}
      <button
        onClick={searchGIFs}
        className="bg-gradient-to-tr from-pink-600 to-pink-400 text-white px-3 py-1 rounded-tr rounded-br"
      >
        <HiOutlineMagnifyingGlass size={25} className="-scale-x-100" />
      </button>
    </div>
  );
};

export default GifSearch;
