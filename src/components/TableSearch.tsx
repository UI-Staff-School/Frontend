import Image from "next/image";
import { ChangeEvent, useState } from "react";

type Props = {
  placeholder?: string;
  onSearchChange?: (value: string) => void;
};

const TableSearch = ({ placeholder = "Search...", onSearchChange }: Props) => {
  const [value, setValue] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    onSearchChange?.(next);
  };

  return (
    <div className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </div>
  );
};

export default TableSearch;
