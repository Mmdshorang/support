import React, { useState } from "react";

import JalaliDatePicker from "../components/common/DatePicker";

export default function CustomerRegistrationForm() {
  const [form, setForm] = useState({
    customerName: "",
    customerNumber: "",
    companyName: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("فرم ارسال شد:", form);
    alert("اطلاعات با موفقیت ثبت شد ✅");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-6 space-y-5 border border-gray-200"
      >
        <h2 className="text-3xl font-semibold text-center text-white mb-4">
          فرم ثبت مشتری
        </h2>

        <div>
          <label className="block text-gray-700 mb-1">نام مشتری</label>
          <input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مثلاً حسین مقدس پور"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">شماره مشتری</label>
          <input
            type="text"
            name="customerNumber"
            value={form.customerNumber}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مثلاً 09120000000"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">نام مجموعه</label>
          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مثلاً حسابان"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-700 mb-1">
              تاریخ اتمام پشتیبانی
            </label>
            <JalaliDatePicker />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          ثبت اطلاعات
        </button>
      </form>
    </div>
  );
}
