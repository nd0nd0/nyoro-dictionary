import { Form } from "react-router";
import { LuSearch } from "react-icons/lu";
import { useDebouncedCallback } from "use-debounce";
import { useEffect, useRef } from "react";

interface SearchBarProps {
  defaultValue?: string;
}

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // Debounced form submission
  const debouncedSubmit = useDebouncedCallback(() => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }, 300);

  return (
    <Form ref={formRef} method="get" action="/" className="relative">
      <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        onChange={debouncedSubmit}
        placeholder="Search words..."
        className="w-full pl-10  pr-4 py-2.5 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        autoComplete="off"
      />
    </Form>
  );
}
