// Shared Tailwind class sets (replaces the old SCSS placeholders / mixins).

export const paddingHome = "px-[4rem] phone:px-[1.6rem]";

export const desc12 = "font-sauce text-[12px] leading-[1.3]";

// Reading roles never drop below the pixel floor; above 1440px they keep growing with the rem.
export const desc16 =
  "font-sauce text-[max(16px,1.6rem)] font-normal leading-[1.3]";

export const desc32 =
  "font-sauce text-[max(24px,3.2rem)] leading-[1.3] tracking-[-0.025em] phone:text-[32px]";

export const title328 =
  "font-bebas text-[32.8rem] [word-break:break-word] phone:text-[160px]";

export const title160 =
  "font-bebas text-[16rem] tracking-[-0.025em] phone:text-[80px] phone:[word-break:break-word]";

export const buttonClass =
  "group/btn inline-block cursor-pointer rounded-[45px] border-2 border-boulder bg-transparent px-[8px] py-[5px] text-[16px] text-ash uppercase transition-all duration-300 ease-[ease] fine:hover:border-gold fine:hover:bg-gold fine:hover:font-medium fine:hover:text-ink aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[loading=true]:pointer-events-none data-[loading=true]:cursor-progress data-[loading=true]:border-gold data-[loading=true]:text-gold";

export const linkChildren =
  "[&_a]:text-boulder [&_a]:transition-colors [&_a]:duration-300 [&_a:hover]:text-gold";

// Form fields (Studio): a hairline underline that turns gold with the label on focus.
// The wrapper must carry `group/field`.
export const fieldLabel =
  "mb-[8px] block font-sauce text-[12px] leading-[1.3] text-boulder uppercase transition-colors duration-200 group-focus-within/field:text-gold";

export const fieldClass =
  "field block w-full rounded-none border-0 border-b-2 border-boulder bg-transparent py-[12px] font-sauce text-[max(16px,1.6rem)] text-ash caret-ash transition-colors duration-200 placeholder:text-boulder focus:border-gold focus:outline-none aria-invalid:border-ash focus:aria-invalid:border-gold";
