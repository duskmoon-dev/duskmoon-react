import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import {
  ArtAtom,
  ArtCSSwitch,
  ArtCatStargazer,
  ArtCircularGallery,
  ArtColorSpin,
  ArtEclipse,
  ArtFlowerAnimation,
  ArtGeminiInput,
  ArtMoon,
  ArtMountain,
  ArtPlasmaBall,
  ArtSnowballPreloader,
  ArtSnowflake,
  ArtSun,
  ArtSynthwaveStarfield,
} from "../src/index";

describe("@duskmoon-dev/art-components", () => {
  test("renders simple art classes and variants", () => {
    const { container } = render(
      <>
        <ArtMoon size="xl" crescent glow className="custom-moon" />
        <ArtSun size="lg" rays sunset pulse />
        <ArtSnowflake unicode fall />
      </>,
    );

    expect(container.querySelector(".art-moon-xl")).toBeTruthy();
    expect(container.querySelector(".art-moon-crescent")).toBeTruthy();
    expect(container.querySelector(".art-moon-glow")).toBeTruthy();
    expect(container.querySelector(".custom-moon")).toBeTruthy();
    expect(container.querySelector(".art-sun-lg")).toBeTruthy();
    expect(container.querySelector(".art-sun-rays")).toBeTruthy();
    expect(container.querySelector(".art-snowflake-unicode")).toBeTruthy();
    expect(container.querySelector(".art-snowflake-fall")).toBeTruthy();
  });

  test("forwards refs and marks decorative art as hidden by default", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ArtAtom ref={ref} aria-label="Atom model" />);

    expect(ref.current?.className).toContain("art-atom");
    expect(ref.current?.getAttribute("aria-hidden")).toBeNull();
    expect(ref.current?.querySelector(".electron-alpha")).toBeTruthy();
    expect(ref.current?.querySelector(".electron-omega")).toBeTruthy();
  });

  test("renders scene structures required by css-art", () => {
    const { container } = render(
      <>
        <ArtEclipse />
        <ArtMountain />
        <ArtCatStargazer />
        <ArtFlowerAnimation />
      </>,
    );

    expect(container.querySelectorAll(".art-eclipse .layer")).toHaveLength(6);
    expect(container.querySelectorAll(".art-mountain .mountain")).toHaveLength(
      4,
    );
    expect(container.querySelectorAll(".art-mountain .borealis")).toHaveLength(
      9,
    );
    expect(
      container.querySelector(".art-cat-stargazer .cat .head .eye"),
    ).toBeTruthy();
    expect(
      container.querySelectorAll(".art-flower-animation .flower"),
    ).toHaveLength(4);
    expect(
      container.querySelectorAll(".art-flower-animation .bubble"),
    ).toHaveLength(20);
  });

  test("renders interactive and generated art structures", () => {
    const { container } = render(
      <>
        <ArtPlasmaBall defaultChecked hideBase hideElectrode />
        <ArtColorSpin />
        <ArtSynthwaveStarfield paused />
        <ArtCSSwitch />
        <ArtSnowballPreloader />
      </>,
    );

    const plasmaInput = container.querySelector(
      ".art-plasma-ball input.switcher",
    ) as HTMLInputElement;

    expect(plasmaInput.checked).toBe(true);
    expect(container.querySelector(".art-plasma-ball-no-base")).toBeTruthy();
    expect(container.querySelector(".electrode.hide-electrode")).toBeTruthy();
    expect(container.querySelectorAll(".art-plasma-ball .rays")).toHaveLength(
      6,
    );
    expect(container.querySelectorAll(".art-color-spin li")).toHaveLength(4);
    expect(
      container.querySelector(".art-synthwave-starfield-paused"),
    ).toBeTruthy();
    expect(
      container.querySelector(".art-csswitch .controller.right"),
    ).toBeTruthy();
    expect(
      container.querySelector(".art-snowball-preloader-track-cover"),
    ).toBeTruthy();
  });

  test("renders circular gallery items with targetable cards", () => {
    const { container } = render(
      <ArtCircularGallery
        title="Featured"
        items={[
          { title: "One", src: "/one.jpg" },
          { id: "custom-two", title: "Two", src: "/two.jpg", alt: "Second" },
        ]}
      />,
    );

    expect(screen.getByText("Featured")).toBeTruthy();
    expect(
      container.querySelectorAll(".art-circular-gallery > div"),
    ).toHaveLength(2);
    expect(container.querySelector("#custom-two")).toBeTruthy();
    expect(screen.getByAltText("Second")).toBeTruthy();
  });

  test("renders gemini input controls and textarea props", () => {
    render(
      <ArtGeminiInput
        placeholder="Ask"
        defaultValue="Hello"
        before="A"
        after="B"
        fieldClassName="custom-field"
      />,
    );

    expect(screen.getByDisplayValue("Hello")).toBeTruthy();
    expect(screen.getByPlaceholderText("Ask").className).toContain(
      "custom-field",
    );
    expect(screen.getByRole("button", { name: "A" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "B" })).toBeTruthy();
  });
});
