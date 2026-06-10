import React, { forwardRef, useId } from "react";
import type {
  ChangeEventHandler,
  ComponentProps,
  CSSProperties,
  ReactNode,
} from "react";

type ClassValue = string | false | null | undefined;

export type ArtSize = "sm" | "default" | "lg";
export type ArtExtendedSize = ArtSize | "xl";
export type ArtStyle = CSSProperties & {
  [key: `--${string}`]: string | number | undefined;
};

function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(" ");
}

function sizeClass(baseClass: string, size?: ArtSize | ArtExtendedSize) {
  return size && size !== "default" ? `${baseClass}-${size}` : undefined;
}

function getDecorativeProps(
  decorative: boolean | undefined,
  props: ComponentProps<"div">,
) {
  if (
    decorative === false ||
    props["aria-hidden"] !== undefined ||
    props["aria-label"] ||
    props["aria-labelledby"] ||
    props.role ||
    props.title
  ) {
    return {};
  }

  return { "aria-hidden": true };
}

function cssUrl(value: string) {
  return `url("${value.replaceAll('"', '\\"')}")`;
}

interface BaseArtProps extends Omit<ComponentProps<"div">, "style"> {
  decorative?: boolean;
  style?: ArtStyle;
}

interface SizedArtProps extends BaseArtProps {
  size?: ArtSize;
}

interface ExtendedSizedArtProps extends BaseArtProps {
  size?: ArtExtendedSize;
}

export interface ArtMoonProps extends ExtendedSizedArtProps {
  crescent?: boolean;
  glow?: boolean;
}

export const ArtMoon = forwardRef<HTMLDivElement, ArtMoonProps>(
  (
    {
      size = "default",
      crescent = false,
      glow = false,
      decorative,
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "art-moon",
        sizeClass("art-moon", size),
        crescent && "art-moon-crescent",
        glow && "art-moon-glow",
        className,
      )}
      {...getDecorativeProps(decorative, props)}
      {...props}
    />
  ),
);
ArtMoon.displayName = "ArtMoon";

export interface ArtSunProps extends ExtendedSizedArtProps {
  rays?: boolean;
  sunset?: boolean;
  pulse?: boolean;
}

export const ArtSun = forwardRef<HTMLDivElement, ArtSunProps>(
  (
    {
      size = "default",
      rays = false,
      sunset = false,
      pulse = false,
      decorative,
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "art-sun",
        sizeClass("art-sun", size),
        rays && "art-sun-rays",
        sunset && "art-sun-sunset",
        pulse && "art-sun-pulse",
        className,
      )}
      {...getDecorativeProps(decorative, props)}
      {...props}
    />
  ),
);
ArtSun.displayName = "ArtSun";

export type ArtAtomProps = SizedArtProps;

export const ArtAtom = forwardRef<HTMLDivElement, ArtAtomProps>(
  ({ size = "default", decorative, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("art-atom", sizeClass("art-atom", size), className)}
      {...getDecorativeProps(decorative, props)}
      {...props}
    >
      <div className="electron" />
      <div className="electron-alpha" />
      <div className="electron-omega" />
    </div>
  ),
);
ArtAtom.displayName = "ArtAtom";

export type ArtEclipseProps = SizedArtProps;

export const ArtEclipse = forwardRef<HTMLDivElement, ArtEclipseProps>(
  ({ size = "default", decorative, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("art-eclipse", sizeClass("art-eclipse", size), className)}
      {...getDecorativeProps(decorative, props)}
      {...props}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={cn("layer", `layer-${index + 1}`)} />
      ))}
    </div>
  ),
);
ArtEclipse.displayName = "ArtEclipse";

export type ArtMountainProps = SizedArtProps;

export const ArtMountain = forwardRef<HTMLDivElement, ArtMountainProps>(
  ({ size = "default", decorative, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("art-mountain", sizeClass("art-mountain", size), className)}
      {...getDecorativeProps(decorative, props)}
      {...props}
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div key={`mountain-${index}`} className="mountain" />
      ))}
      {Array.from({ length: 3 }, (_, index) => (
        <div key={`tree-${index}`} className="tree" />
      ))}
      <div className="lights">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={index} className="borealis" />
        ))}
      </div>
    </div>
  ),
);
ArtMountain.displayName = "ArtMountain";

export interface ArtSnowflakeProps extends BaseArtProps {
  unicode?: boolean;
  fall?: boolean;
}

export const ArtSnowflake = forwardRef<HTMLDivElement, ArtSnowflakeProps>(
  ({ unicode = false, fall = false, decorative, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "art-snowflake",
        unicode && "art-snowflake-unicode",
        fall && "art-snowflake-fall",
        className,
      )}
      {...getDecorativeProps(decorative, props)}
      {...props}
    />
  ),
);
ArtSnowflake.displayName = "ArtSnowflake";

function PlasmaRay({ bigwave = false }: { bigwave?: boolean }) {
  return (
    <div className={cn("ray", bigwave && "bigwave")}>
      <span />
      <span />
      <span />
    </div>
  );
}

function PlasmaRays({ group }: { group: number }) {
  const rayCount = group > 3 ? 3 : 5;

  return (
    <div className="rays">
      {Array.from({ length: rayCount }, (_, index) => (
        <PlasmaRay key={index} bigwave={group >= 4 || index % 2 === 1} />
      ))}
    </div>
  );
}

export interface ArtPlasmaBallProps extends SizedArtProps {
  checked?: boolean;
  defaultChecked?: boolean;
  hideBase?: boolean;
  hideElectrode?: boolean;
  inputProps?: Omit<
    ComponentProps<"input">,
    "type" | "checked" | "defaultChecked"
  >;
  onCheckedChange?: (checked: boolean) => void;
}

export const ArtPlasmaBall = forwardRef<HTMLDivElement, ArtPlasmaBallProps>(
  (
    {
      size = "default",
      checked,
      defaultChecked,
      hideBase = false,
      hideElectrode = false,
      inputProps,
      onCheckedChange,
      className,
      ...props
    },
    ref,
  ) => {
    const {
      className: inputClassName,
      onChange: inputOnChange,
      ...restInputProps
    } = inputProps ?? {};
    const inputLabelProps =
      restInputProps["aria-label"] || restInputProps["aria-labelledby"]
        ? {}
        : { "aria-label": "Toggle plasma ball" };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      onCheckedChange?.(event.currentTarget.checked);
      inputOnChange?.(event);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "art-plasma-ball",
          sizeClass("art-plasma-ball", size),
          hideBase && "art-plasma-ball-no-base",
          className,
        )}
        {...props}
      >
        <input
          type="checkbox"
          className={cn("switcher", inputClassName)}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          {...inputLabelProps}
          {...restInputProps}
        />
        <div className="glassball">
          <div className={cn("electrode", hideElectrode && "hide-electrode")} />
          {Array.from({ length: 6 }, (_, index) => (
            <PlasmaRays key={index} group={index} />
          ))}
        </div>
        <div className="base">
          <div />
          <div />
          <span />
        </div>
        <div className="switch" />
      </div>
    );
  },
);
ArtPlasmaBall.displayName = "ArtPlasmaBall";

export interface ArtCircularGalleryItem {
  id?: string;
  title: string;
  src: string;
  href?: string;
  alt?: string;
  target?: ComponentProps<"a">["target"];
  rel?: ComponentProps<"a">["rel"];
}

export interface ArtCircularGalleryProps extends Omit<SizedArtProps, "title"> {
  title?: ReactNode;
  items: ArtCircularGalleryItem[];
}

export const ArtCircularGallery = forwardRef<
  HTMLDivElement,
  ArtCircularGalleryProps
>(
  (
    {
      title = "Gallery",
      items,
      size = "default",
      decorative,
      className,
      ...props
    },
    ref,
  ) => {
    const reactId = useId().replaceAll(":", "");

    return (
      <div
        ref={ref}
        className={cn(
          "art-circular-gallery",
          sizeClass("art-circular-gallery", size),
          className,
        )}
        {...getDecorativeProps(decorative, props)}
        {...props}
      >
        {title ? <h1>{title}</h1> : null}
        {items.map((item, index) => {
          const id = item.id ?? `${reactId}-gallery-item-${index + 1}`;
          const itemStyle = {
            "--i": index + 1,
            "--bg-img": cssUrl(item.src),
          } as ArtStyle;

          return (
            <div key={id} id={id} data-title={item.title} style={itemStyle}>
              <a
                href={item.href ?? `#${id}`}
                target={item.target}
                rel={item.rel}
              >
                <img src={item.src} alt={item.alt ?? item.title} />
              </a>
            </div>
          );
        })}
      </div>
    );
  },
);
ArtCircularGallery.displayName = "ArtCircularGallery";

export type ArtCatStargazerProps = SizedArtProps;

export const ArtCatStargazer = forwardRef<HTMLDivElement, ArtCatStargazerProps>(
  ({ size = "default", decorative, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "art-cat-stargazer",
        sizeClass("art-cat-stargazer", size),
        className,
      )}
      {...getDecorativeProps(decorative, props)}
      {...props}
    >
      <div className="moon" />
      <div className="cat">
        <div className="bubble" />
        <div className="backpack" />
        <div className="tail" />
        <div className="body">
          <div className="leg" />
          <div className="paw" />
          <div className="paw" />
        </div>
        <div className="ear" />
        <div className="ear" />
        <div className="head">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="whisker" />
          ))}
          <div className="nose" />
          <div className="eye" />
          <div className="eye" />
        </div>
      </div>
    </div>
  ),
);
ArtCatStargazer.displayName = "ArtCatStargazer";

function Flower({ index }: { index: 1 | 2 | 3 | 4 }) {
  const leafCount = index === 1 ? 6 : 4;

  return (
    <div className={cn("flower", `flower--${index}`)}>
      <div
        className={cn("flower__leafs", `flower__leafs--${Math.min(index, 3)}`)}
      >
        {Array.from({ length: 4 }, (_, leafIndex) => (
          <div
            key={leafIndex}
            className={cn("flower__leaf", `flower__leaf--${leafIndex + 1}`)}
          />
        ))}
        <div className="flower__white-circle" />
      </div>
      <div className="flower__line">
        {Array.from({ length: leafCount }, (_, leafIndex) => (
          <div
            key={leafIndex}
            className={cn(
              "flower__line__leaf",
              `flower__line__leaf--${leafIndex + 1}`,
            )}
          />
        ))}
      </div>
      {Array.from({ length: 8 }, (_, lightIndex) => (
        <div
          key={lightIndex}
          className={cn("flower__light", `flower__light--${lightIndex + 1}`)}
        />
      ))}
    </div>
  );
}

function FlowerGrass({ index }: { index: 1 | 2 }) {
  return (
    <div className={cn("flower__grass", `flower__grass--${index}`)}>
      <div className="flower__grass--top" />
      <div className="flower__grass--bottom" />
      {Array.from({ length: 8 }, (_, leafIndex) => (
        <div
          key={leafIndex}
          className={cn(
            "flower__grass__leaf",
            `flower__grass__leaf--${leafIndex + 1}`,
          )}
        />
      ))}
      <div className="flower__grass__overlay" />
    </div>
  );
}

function LongGrass({ index }: { index: number }) {
  return (
    <div className={cn("long-g", `long-g--${index}`)}>
      {Array.from({ length: 4 }, (_, leafIndex) => (
        <div key={leafIndex} className={cn("leaf", `leaf--${leafIndex}`)} />
      ))}
    </div>
  );
}

function FrontGrass() {
  return (
    <div className="flower__g-front">
      <div className="flower__g-front__line">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className={cn(
              "flower__g-front__leaf-wrapper",
              `flower__g-front__leaf-wrapper--${index + 1}`,
            )}
          >
            <div className="flower__g-front__leaf" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FrontRightGrass() {
  return (
    <div className="flower__g-fr">
      <div className="leaf" />
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className={cn(
            "flower__g-fr__leaf",
            `flower__g-fr__leaf--${index + 1}`,
          )}
        />
      ))}
    </div>
  );
}

function Bubble() {
  return (
    <div className="bubble">
      <svg className="heart" viewBox="0 0 32 29.6" aria-hidden="true">
        <path d="M23.6 0c-2.9 0-5.6 1.6-7.6 4.1C14 1.6 11.3 0 8.4 0 3.8 0 0 3.8 0 8.4c0 9.3 16 21.2 16 21.2S32 17.7 32 8.4C32 3.8 28.2 0 23.6 0z" />
      </svg>
    </div>
  );
}

export type ArtFlowerAnimationProps = SizedArtProps;

export const ArtFlowerAnimation = forwardRef<
  HTMLDivElement,
  ArtFlowerAnimationProps
>(({ size = "default", decorative, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "art-flower-animation",
      sizeClass("art-flower-animation", size),
      className,
    )}
    {...getDecorativeProps(decorative, props)}
    {...props}
  >
    <div className="night" />
    <div className="flowers">
      <Flower index={1} />
      <Flower index={2} />
      <Flower index={3} />
      <Flower index={4} />
      <div className="growing-grass">
        <FlowerGrass index={1} />
        <FlowerGrass index={2} />
      </div>
      <div className="flower__g-long">
        <div className="flower__g-long__top" />
        <div className="flower__g-long__bottom" />
      </div>
      <div className="flower__g-right flower__g-right--1">
        <div className="leaf" />
      </div>
      <div className="flower__g-right flower__g-right--2">
        <div className="leaf" />
      </div>
      <FrontGrass />
      <FrontRightGrass />
      {Array.from({ length: 7 }, (_, index) => (
        <LongGrass key={index} index={index + 1} />
      ))}
      <div className="bubbles">
        {Array.from({ length: 20 }, (_, index) => (
          <Bubble key={index} />
        ))}
      </div>
    </div>
  </div>
));
ArtFlowerAnimation.displayName = "ArtFlowerAnimation";

export type ArtColorSpinProps = SizedArtProps;

export const ArtColorSpin = forwardRef<HTMLDivElement, ArtColorSpinProps>(
  ({ size = "default", decorative, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "art-color-spin",
        sizeClass("art-color-spin", size),
        className,
      )}
      {...getDecorativeProps(decorative, props)}
      {...props}
    >
      <ul>
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} style={{ "--i": index } as ArtStyle} />
        ))}
      </ul>
    </div>
  ),
);
ArtColorSpin.displayName = "ArtColorSpin";

export interface ArtSynthwaveStarfieldProps extends SizedArtProps {
  paused?: boolean;
}

export const ArtSynthwaveStarfield = forwardRef<
  HTMLDivElement,
  ArtSynthwaveStarfieldProps
>(
  (
    { size = "default", paused = false, decorative, className, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "art-synthwave-starfield",
        sizeClass("art-synthwave-starfield", size),
        paused && "art-synthwave-starfield-paused",
        className,
      )}
      {...getDecorativeProps(decorative, props)}
      {...props}
    >
      <div className="art-synthwave-starfield-sides art-synthwave-starfield-lefrig" />
      <div className="art-synthwave-starfield-sides art-synthwave-starfield-topbot" />
      <div className="art-synthwave-starfield-stars" />
      <div className="art-synthwave-starfield-stars" />
    </div>
  ),
);
ArtSynthwaveStarfield.displayName = "ArtSynthwaveStarfield";

function SwitchButton({ className }: { className: string }) {
  return (
    <button
      type="button"
      className={className}
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

function SwitchBar() {
  return (
    <div className="bar">
      <SwitchButton className="sub-lr" />
      <SwitchButton className="sub-rr" />
      <span className="minus-sign" />
      <span className="peripheral" />
      <span className="cord" />
    </div>
  );
}

function SwitchConnector() {
  return (
    <div className="connector">
      <div className="con-lr">
        <div className="con-part" />
      </div>
      <div className="con-rr">
        <div className="con-part" />
      </div>
    </div>
  );
}

function LeftJoycon() {
  return (
    <div className="controller">
      <SwitchBar />
      <SwitchConnector />
      <SwitchButton className="minus" />
      <SwitchButton className="mushroom round" />
      <SwitchButton className="direction arrow up round" />
      <SwitchButton className="direction arrow down round" />
      <SwitchButton className="direction arrow left round" />
      <SwitchButton className="direction arrow right round" />
      <SwitchButton className="menu" />
    </div>
  );
}

function RightJoycon() {
  return (
    <div className="controller right">
      <SwitchBar />
      <SwitchConnector />
      <SwitchButton className="minus plus" />
      <SwitchButton className="mushroom round" />
      <SwitchButton className="direction x round" />
      <SwitchButton className="direction y round" />
      <SwitchButton className="direction a round" />
      <SwitchButton className="direction b round" />
      <SwitchButton className="home round" />
    </div>
  );
}

function SwitchBody() {
  return (
    <div className="body">
      <div className="frame">
        <div className="screen" />
      </div>
      <div className="lr" />
      <div className="lr rr" />
      <div className="volume" />
    </div>
  );
}

function ComfortGrip() {
  return (
    <div className="comfort-grip">
      <div className="grip" />
      <div className="grip right" />
      <div className="holder">
        <div className="main-frame">
          <div className="logo" />
          <div className="logo right" />
          <div className="nintendo">NINTENDO</div>
          <div className="switch">SWITCH</div>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="light" />
          ))}
        </div>
      </div>
    </div>
  );
}

export type ArtCsswitchProps = SizedArtProps;

export const ArtCsswitch = forwardRef<HTMLDivElement, ArtCsswitchProps>(
  ({ size = "default", decorative, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("art-csswitch", sizeClass("art-csswitch", size), className)}
      {...getDecorativeProps(decorative, props)}
      {...props}
    >
      <SwitchBody />
      <ComfortGrip />
      <LeftJoycon />
      <RightJoycon />
    </div>
  ),
);
ArtCsswitch.displayName = "ArtCsswitch";

export const ArtCSSwitch = ArtCsswitch;

export type ArtSnowballPreloaderProps = SizedArtProps;

export const ArtSnowballPreloader = forwardRef<
  HTMLDivElement,
  ArtSnowballPreloaderProps
>(({ size = "default", decorative, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "art-snowball-preloader",
      sizeClass("art-snowball-preloader", size),
      className,
    )}
    {...getDecorativeProps(decorative, props)}
    {...props}
  >
    <div className="art-snowball-preloader-outer-ring" />
    <div className="art-snowball-preloader-inner-ring" />
    <div className="art-snowball-preloader-track-cover" />
    <div className="art-snowball-preloader-ball">
      <div className="art-snowball-preloader-ball-texture" />
      <div className="art-snowball-preloader-ball-inner-shadow" />
      <div className="art-snowball-preloader-ball-outer-shadow" />
      <div className="art-snowball-preloader-ball-side-shadows" />
    </div>
  </div>
));
ArtSnowballPreloader.displayName = "ArtSnowballPreloader";

type GeminiButtonProps = Omit<ComponentProps<"button">, "children">;

export interface ArtGeminiInputProps extends Omit<
  BaseArtProps,
  "children" | "onChange" | "defaultValue" | "style"
> {
  size?: ArtSize;
  style?: ArtStyle;
  value?: ComponentProps<"textarea">["value"];
  defaultValue?: ComponentProps<"textarea">["defaultValue"];
  onChange?: ComponentProps<"textarea">["onChange"];
  placeholder?: string;
  name?: string;
  rows?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fieldClassName?: string;
  textareaProps?: Omit<
    ComponentProps<"textarea">,
    | "className"
    | "value"
    | "defaultValue"
    | "onChange"
    | "placeholder"
    | "name"
    | "rows"
    | "disabled"
    | "readOnly"
    | "required"
  >;
  before?: ReactNode;
  after?: ReactNode;
  beforeButtonProps?: GeminiButtonProps;
  afterButtonProps?: GeminiButtonProps;
}

export const ArtGeminiInput = forwardRef<HTMLDivElement, ArtGeminiInputProps>(
  (
    {
      size = "default",
      className,
      value,
      defaultValue,
      onChange,
      placeholder,
      name,
      rows,
      disabled,
      readOnly,
      required,
      fieldClassName,
      textareaProps,
      before = "+",
      after = ">",
      beforeButtonProps,
      afterButtonProps,
      ...props
    },
    ref,
  ) => {
    const {
      className: beforeButtonClassName,
      type: beforeButtonType = "button",
      ...restBeforeButtonProps
    } = beforeButtonProps ?? {};
    const {
      className: afterButtonClassName,
      type: afterButtonType = "button",
      ...restAfterButtonProps
    } = afterButtonProps ?? {};

    return (
      <div
        ref={ref}
        className={cn(
          "art-gemini-input",
          sizeClass("art-gemini-input", size),
          className,
        )}
        {...props}
      >
        <div className="art-gemini-input-border" />
        <div className="art-gemini-input-inner">
          {before !== null ? (
            <button
              type={beforeButtonType}
              className={cn("art-gemini-input-btn", beforeButtonClassName)}
              disabled={disabled || beforeButtonProps?.disabled}
              {...restBeforeButtonProps}
            >
              {before}
            </button>
          ) : null}
          <textarea
            className={cn("art-gemini-input-field", fieldClassName)}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            placeholder={placeholder}
            name={name}
            rows={rows}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            {...textareaProps}
          />
          {after !== null ? (
            <button
              type={afterButtonType}
              className={cn("art-gemini-input-btn", afterButtonClassName)}
              disabled={disabled || afterButtonProps?.disabled}
              {...restAfterButtonProps}
            >
              {after}
            </button>
          ) : null}
        </div>
      </div>
    );
  },
);
ArtGeminiInput.displayName = "ArtGeminiInput";
