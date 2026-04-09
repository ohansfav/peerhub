import { Search, SearchIcon } from "lucide-react";

const SearchBar = ({ value, onChange, onSearch }) => (
  <>
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search for Tutor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="w-full pl-10 sm:pr-4 py-1 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none "
      />
    </div>
    <button
      onClick={onSearch}
      className="ml-2 px-2 sm:px-4 py-2 sm:py-3 bg-primary text-white rounded-full sm:rounded-lg hover:bg-primary-dark transition"
    >
      <span className="hidden sm:inline">Search</span>
      <SearchIcon className="w-5 h-5 sm:hidden" />
    </button>
  </>
);

export default SearchBar;
