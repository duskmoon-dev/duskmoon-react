import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
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
    expect(
      container.querySelectorAll(".art-cat-stargazer .body > .leg"),
    ).toHaveLength(2);
    expect(
      container.querySelector(".art-cat-stargazer .cat > :first-child")
        ?.className,
    ).toBe("tail");
    expect(
      container.querySelector(".art-cat-stargazer .cat > :last-child")
        ?.className,
    ).toBe("bubble");
    expect(
      container.querySelector(".art-cat-stargazer .head > :last-child")
        ?.className,
    ).toBe("nose");
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

  test("preserves plasma checkbox state and the CSS ray anatomy", () => {
    const changes: boolean[] = [];
    const inputChanges: boolean[] = [];
    const { container, rerender } = render(
      <ArtPlasmaBall
        onCheckedChange={(checked) => changes.push(checked)}
        inputProps={{
          onChange: (event) => inputChanges.push(event.currentTarget.checked),
        }}
      />,
    );
    const input = screen.getByRole("checkbox", {
      name: "Toggle plasma ball",
    }) as HTMLInputElement;
    fireEvent.click(input);
    expect(input.checked).toBe(true);
    expect(changes).toEqual([true]);
    expect(inputChanges).toEqual([true]);
    const groups = container.querySelectorAll(".glassball > .rays");
    expect(Array.from(groups, (group) => group.children.length)).toEqual([
      5, 5, 5, 5, 3, 3,
    ]);
    expect(container.querySelectorAll(".ray.bigwave")).toHaveLength(8);
    for (const wave of container.querySelectorAll(".ray.bigwave")) {
      expect(wave.children.length).toBe(2);
    }
    for (const group of Array.from(groups).slice(4)) {
      expect(group.querySelectorAll(".bigwave")).toHaveLength(0);
    }
    rerender(
      <ArtPlasmaBall
        key="controlled"
        checked={false}
        inputProps={{ disabled: true }}
      />,
    );
    const disabledInput = screen.getByRole("checkbox") as HTMLInputElement;
    expect(disabledInput.checked).toBe(false);
    expect(disabledInput.disabled).toBe(true);
  });

  test("positions garden leaves and bubbles in their CSS containing blocks", () => {
    const { container } = render(<ArtFlowerAnimation />);
    const scene = container.querySelector(".art-flower-animation")!;
    expect(scene.querySelector(":scope > .bubbles")).toBeTruthy();
    expect(scene.querySelectorAll(".flowers > .growing-grass")).toHaveLength(2);
    expect(scene.querySelectorAll(".long-g")).toHaveLength(8);
    expect(
      scene.querySelector(".long-g--0 .grow-ans")?.getAttribute("style"),
    ).toContain("--d: 3s");
    expect(scene.querySelectorAll(".long-g > .grow-ans > .leaf")).toHaveLength(
      32,
    );
    expect(
      scene.querySelectorAll(
        ".flower__g-front > .flower__g-front__leaf-wrapper",
      ),
    ).toHaveLength(8);
    expect(
      scene.querySelector(".flower__g-front > :last-child")?.className,
    ).toBe("flower__g-front__line");
    expect(
      scene.querySelectorAll(".flower__leafs > .flower__light"),
    ).toHaveLength(32);
  });

  test("exposes console controls without submitting a surrounding form", () => {
    let submissions = 0;
    const { container, rerender } = render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submissions++;
        }}
      >
        <ArtCSSwitch />
      </form>,
    );
    const scene = container.querySelector(".art-csswitch")!;
    expect(scene.querySelectorAll(":scope > .comfort-grip")).toHaveLength(2);
    expect(scene.querySelectorAll(".connector > button")).toHaveLength(4);
    expect(scene.querySelectorAll(".body > .frame + .screen")).toHaveLength(1);
    expect(
      scene.querySelectorAll(".main-frame > .light:nth-child(-n+8)"),
    ).toHaveLength(8);
    for (const name of [
      "L",
      "R",
      "Volume",
      "Left connector L",
      "Right connector R",
    ]) {
      const button = screen.getByRole("button", { name });
      expect(button.getAttribute("type")).toBe("button");
      fireEvent.click(button);
    }
    expect(submissions).toBe(0);
    rerender(<ArtCSSwitch decorative />);
    for (const button of container.querySelectorAll("button")) {
      expect(button.tabIndex).toBe(-1);
    }
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
