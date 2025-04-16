interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  onSearch,
  isLoading = false,
}: SearchInputProps) {
  return (
    <div className='flex gap-2'>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Search by location or restaurant name'
        className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch();
          }
        }}
      />
      <button
        onClick={onSearch}
        disabled={isLoading}
        className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </div>
  );
}
