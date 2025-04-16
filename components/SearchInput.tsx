import { useState } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export default function SearchInput({ onSearch, loading = false }: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-2xl mx-auto'>
      <div className='relative'>
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search by restaurant name, address, or cuisine type'
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          disabled={loading}
        />
        <button
          type='submit'
          disabled={loading}
          className='absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed'>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}
