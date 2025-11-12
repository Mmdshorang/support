import { useState } from "react";

interface Issue {
  id: number;
  type: string;
}

export default function IssuesList() {
  const [issues, setIssues] = useState<Issue[]>([
    { id: 1, type: "ارور سرور" },
    { id: 2, type: "مشکل در فرم ورود" },
    { id: 3, type: "تاخیر در لود صفحه" },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newType, setNewType] = useState<string>("");
  const [newIssue, setNewIssue] = useState<string>("");

  const handleDelete = (id: number) => {
    setIssues(issues.filter((issue) => issue.id !== id));
  };

  const handleEdit = (id: number, type: string) => {
    setEditingId(id);
    setNewType(type);
  };

  const handleSave = (id: number) => {
    if (!newType.trim()) return;
    setIssues(
      issues.map((issue) =>
        issue.id === id ? { ...issue, type: newType.trim() } : issue
      )
    );
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newIssue.trim()) return;
    const newId = issues.length ? issues[issues.length - 1].id + 1 : 1;
    setIssues([...issues, { id: newId, type: newIssue.trim() }]);
    setNewIssue("");
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-6 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center border-b pb-3">
          🛠️ لیست مشکلات سیستم
        </h2>

        {/* فرم اضافه کردن مشکل */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="افزودن مشکل جدید..."
            value={newIssue}
            onChange={(e) => setNewIssue(e.target.value)}
            className="flex-grow border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition"
          >
            افزودن
          </button>
        </div>

        {/* جدول */}
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-right">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4">شماره</th>
                <th className="py-3 px-4">نوع مشکل</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, index) => (
                <tr
                  key={issue.id}
                  className={`border-t hover:bg-blue-50 transition-all duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-2 px-4">{issue.id}</td>
                  <td className="py-2 px-4">
                    {editingId === issue.id ? (
                      <input
                        type="text"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="border rounded px-2 py-1 w-full focus:outline-none focus:ring focus:ring-blue-200"
                      />
                    ) : (
                      <span className="text-gray-800">{issue.type}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center flex justify-center gap-2">
                    {editingId === issue.id ? (
                      <button
                        onClick={() => handleSave(issue.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                      >
                        ذخیره
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(issue.id, issue.type)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                      >
                        ویرایش
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(issue.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {issues.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    هیچ مشکلی ثبت نشده است 😌
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
