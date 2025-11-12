import { useState } from "react";
import SelectBox, { type Option } from "../components/common/SelectBox";

const options = [
  { value: "1", label: "گزینه اول" },
  { value: "2", label: "گزینه دوم" },
];

export const submitTicket = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [val, setVal] = useState<Option | Option[] | null>(null);
  return (
    <>
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gray-300 p-4"
      >
        <form
          onSubmit={() => {}}
          className="w-full bg-white max-w-xl shadow-2xl rounded-2xl p-6 space-y-5 border border-gray-200"
        >
          <h2 className="text-3xl font-semibold text-center text-black mb-4">
            فرم ثبت تیکت
          </h2>

          <div>
            <label className="block text-gray-700 mb-1">نام تماس گیرنده</label>
            <input
              type="text"
              name="customerName"
              value={""}
              onChange={() => {}}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              شماره تماس گیرنده
            </label>
            <input
              type="text"
              name="customerNumber"
              value={""}
              onChange={() => {}}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">موضوع مشکل</label>
            <SelectBox
              options={options}
              value={val}
              onChange={setVal}
              placeholder="یک مورد انتخاب کن"
              searchable={true}
              multiple={false}
              creatable={true}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">راه حل</label>
            <textarea
              name="companyName"
              value={""}
              onChange={() => {}}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-5">
            <label className="block text-gray-700 mb-1">نوع پشتیبانی</label>
            <h6 className="flex gap-3">
              حضوری
              <input type="radio" name="type" id="1" />
            </h6>
            <h6 className="flex gap-3">
              غیرحضوری
              <input type="radio" name="type" id="1" />
            </h6>
          </div>
          <div className="flex gap-5">
            <label className="block text-gray-700 mb-1">وضعیت تیکت</label>
            <h6 className="flex gap-3">
              باز
              <input type="radio" name="type" id="1" />
            </h6>
            <h6 className="flex gap-3">
              بسته
              <input type="radio" name="type" id="1" />
            </h6>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            ثبت تیکت
          </button>
        </form>
      </div>
    </>
  );
};
