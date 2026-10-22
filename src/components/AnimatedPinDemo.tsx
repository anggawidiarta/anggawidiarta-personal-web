import { PinContainer } from "./ui/3d-pin";

/**
 * Props for the AnimatedPinDemo component
 */
interface AnimatedPinDemoProps {
  title: string; // The title of the pin
  headTitle: string; // The title of the pin
  desc: string; // The description of the pin
  href: string; // The URL the pin should navigate to
  backgroundImageUrl: string; // The URL for the background image
}

/**
 * Component for displaying an animated pin with title, description, and background image
 * @param title - The title of the pin
 * @param desc - The description of the pin
 * @param href - The URL the pin should navigate to
 * @param backgroundImageUrl - The URL for the background image
 */
export function AnimatedPinDemo({
  headTitle,
  title,
  desc,
  href,
  backgroundImageUrl,
}: AnimatedPinDemoProps) {
  return (
    <div className="h-[40rem] w-full flex items-center justify-center ">
      <PinContainer title={headTitle} href={href}>
        <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[24rem] h-[30rem] ">
          <h3 className="max-w-xs pb-2! m-0! font-bold text-base lg:text-xl text-[#F6C90E] w-max tracking-wider drop-shadow-sm">
            {title}
          </h3>
          <div className="lg:text-lg text-base m-0! p-0! font-normal w-max">
            <span className="text-slate-500 ">{desc}</span>
          </div>
          <div
            className="flex flex-1 w-full mt-4 bg-center bg-cover rounded-lg"
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
            }}
          />
        </div>
      </PinContainer>
    </div>
  );
}
