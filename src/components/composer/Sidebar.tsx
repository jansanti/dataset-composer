import { Category, Entry } from "../../types/dataset";

interface SidebarProps {
  categories: Category[];
  entries: Entry[];
  activeEntry: Entry | null;
  onSelectEntry: (e: Entry) => void;
  onCreateCategory: (name: string) => void;
  onRenameCategory: (cat: Category) => void;
  onDeleteCategory: (cat: Category) => void;
  onCreateEntry: (catId?: string) => void;
  onRenameEntry: (entry: Entry) => void;
  onDeleteEntry: (entry: Entry) => void;
  search: string;
  onSearch: (s: string) => void;
  defaultCategoryId: string;
}

export default function Sidebar({
  categories,
  entries,
  activeEntry,
  onSelectEntry,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
  onCreateEntry,
  onRenameEntry,
  onDeleteEntry,
  search,
  onSearch,
}: SidebarProps) {
  const matchesSearch = (entry: Entry) => {
    if (!search.trim()) return true;
    return (entry.title ?? "").toLowerCase().includes(search.toLowerCase());
  };

  return (
    <aside className="w-72 flex flex-col gap-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Workspace</h2>
          <button
            onClick={() => onCreateCategory("New category")}
            className="text-xs px-2 py-1 rounded-md bg-slate-900 text-white hover:bg-slate-700"
          >
            + Category
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search entries..."
          className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
        />
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg bg-white border">
        {categories.map((cat) => {
          const catEntries = entries.filter(
            (e) => e.categoryId === cat.id && matchesSearch(e)
          );
          return (
            <div key={cat.id} className="border-b last:border-b-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50">
                <button
                  onClick={() =>
                    // toggle collapsed
                    onRenameCategory({ ...cat, collapsed: !cat.collapsed })
                  }
                  className="text-xs text-slate-500"
                >
                  {cat.collapsed ? "▶" : "▼"}
                </button>
                <p
                  className="flex-1 text-sm font-medium cursor-pointer"
                  onDoubleClick={() => onRenameCategory(cat)}
                >
                  {cat.name}
                </p>
                {cat.id !== "cat-uncategorized" && (
                  <>
                    <button
                      onClick={() => onRenameCategory(cat)}
                      className="text-[10px] px-1 py-0.5 bg-slate-100 rounded hover:bg-slate-200"
                    >
                      📝
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat)}
                      className="text-[10px] px-1 py-0.5 bg-red-50 text-red-500 rounded hover:bg-red-100"
                    >
                      🗑
                    </button>
                  </>
                )}
                <button
                  onClick={() => onCreateEntry(cat.id)}
                  className="text-[10px] px-1 py-0.5 bg-slate-900 text-white rounded hover:bg-slate-700"
                >
                  +
                </button>
              </div>
              {!cat.collapsed && (
                <div className="flex flex-col">
                  {catEntries.length === 0 ? (
                    <p className="text-[11px] text-slate-400 px-5 py-2">No entries</p>
                  ) : (
                    catEntries.map((e) => (
                      <div
                        key={e.id}
                        className={`group flex items-center justify-between gap-2 px-5 py-2 cursor-pointer ${
                          activeEntry?.id === e.id ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                        onClick={() => onSelectEntry(e)}
                      >
                        <div className="min-w-0">
                          <p className="text-sm truncate">{e.title ?? `Entry ${e.id}`}</p>
                          <p className="text-[10px] text-slate-400">
                            {e.messages.length} message{e.messages.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              onRenameEntry(e);
                            }}
                            className="text-[10px] px-1 py-0.5 bg-slate-100 rounded hover:bg-slate-200"
                          >
                            📝
                          </button>
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              onDeleteEntry(e);
                            }}
                            className="text-[10px] px-1 py-0.5 bg-red-50 text-red-500 rounded hover:bg-red-100"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
