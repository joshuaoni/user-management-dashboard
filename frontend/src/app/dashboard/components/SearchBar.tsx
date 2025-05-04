"use client";

interface SearchBarProps {
  searchQuery: string;
  selectedRole: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

const SearchBar = ({
  searchQuery,
  selectedRole,
  loading,
  onSearchChange,
  onRoleChange,
}: SearchBarProps) => {
  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
      </div>
      <div className="w-full sm:w-40">
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
    </div>
  );
};

export default SearchBar;
