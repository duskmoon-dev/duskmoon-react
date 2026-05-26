# Component API Inventory

Snapshot date: 2026-05-25

This inventory defines what `@duskmoon-dev/components` should implement in this
repo. z-design and Ant Design are API and behavior references only. Do not copy
their source code into this repo.

## Implementation Policy

- Implement components in this repo as DuskMoon React components.
- Use `@duskmoon-dev/design` generated tokens as the token source of truth.
- Use DuskMoon UI/Core class recipes where they exist.
- Do not source-port z-design implementation files.
- Do not expose z-design `Z*` names as the primary public API. Map them to `Dm*`.
- Do not rely on `export * from 'antd'` as the final solution. The target package
  should own its public exports, tests, docs, and package subpaths.
- A behavior dependency can be considered per component, but it must be an
  explicit dependency decision, not a copied implementation.

## Target Export Layers

1. Ant Design-compatible generic components:
   `Button`, `Input`, `Table`, `Modal`, `Select`, etc.
2. DuskMoon-prefixed workflow components mapped from z-design:
   `DmLayout`, `DmSearch`, `DmTable`, `DmProTable`, etc.
3. Provider and infrastructure APIs:
   `DmProvider`, theme/token helpers, locale helpers, and service holders.

## Ant Design-Compatible Components

These are included because z-design re-exports all Ant Design APIs before
overriding selected components. Target API names stay unprefixed.

| Component        | Feature API to Implement                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Affix`          | offset top/bottom, scroll target, fixed state change callback, ref                                                                                             |
| `Alert`          | type/status, closable, banner, icon, action, description, `ErrorBoundary`                                                                                      |
| `Anchor`         | items/links, target container, bounds/offset, active link, click/change callbacks                                                                              |
| `App`            | app-level message/notification/modal context, `useApp`-style access                                                                                            |
| `AutoComplete`   | options, value/defaultValue, search/select/change callbacks, filtering, `Option`                                                                               |
| `Avatar`         | size, shape, src/srcSet, icon, alt, fallback children, `Group`                                                                                                 |
| `BackTop`        | visibility height, target container, click callback, custom child                                                                                              |
| `Badge`          | count, dot, status, color, text, overflow count, offset, `Ribbon`                                                                                              |
| `Breadcrumb`     | items, separators, menu items, item render, route-style data                                                                                                   |
| `Button`         | type/color/variant, size, shape, icon, loading, disabled, block, link/href, `Group`                                                                            |
| `Calendar`       | value/defaultValue, mode, fullscreen, date/month cell render, select/panel callbacks                                                                           |
| `Card`           | title, extra, cover, actions, loading, hoverable, tab list, `Grid`, `Meta`                                                                                     |
| `Carousel`       | autoplay, arrows/dots, effect, speed, before/after change callbacks                                                                                            |
| `Cascader`       | options, value, multiple, search, display render, lazy loading, `Panel`, show constants                                                                        |
| `Checkbox`       | checked/defaultChecked, indeterminate, disabled, change callback, `Group` options                                                                              |
| `Col`            | span, offset, order, push/pull, breakpoint props                                                                                                               |
| `Collapse`       | items, active keys, accordion, bordered/ghost, expand icon, `Panel`                                                                                            |
| `ColorPicker`    | value/defaultValue, format, presets, trigger, show text, change callbacks                                                                                      |
| `ConfigProvider` | theme, locale, prefix, popup container, render empty, direction, virtual/wave config                                                                           |
| `DatePicker`     | value, picker modes, format, show time, disabled date/time, presets, `RangePicker`, `WeekPicker`, `MonthPicker`, `QuarterPicker`, `YearPicker`                 |
| `Descriptions`   | items, bordered, size, column, layout, label/content style, `Item`                                                                                             |
| `Divider`        | horizontal/vertical type, orientation, plain, dashed                                                                                                           |
| `Drawer`         | open state, placement, size, title, extra/footer, close, container, loading/destroy behavior                                                                   |
| `Dropdown`       | menu, trigger, placement, open state, arrow, destroy behavior, `Button`                                                                                        |
| `Empty`          | image, description, custom children, presented image constants                                                                                                 |
| `Flex`           | align, justify, gap, vertical, wrap, flex children layout                                                                                                      |
| `FloatButton`    | icon, type, shape, tooltip, description, badge, `Group`, `BackTop`                                                                                             |
| `Form`           | form instance, layout, fields, validation rules, dependencies, submit/reset, `Item`, `List`, `ErrorList`, `Provider`                                           |
| `Grid`           | breakpoint hooks and responsive utilities                                                                                                                      |
| `Image`          | src, preview, fallback, placeholder, toolbar operations, `PreviewGroup`                                                                                        |
| `Input`          | value/defaultValue, size/status, allowClear, prefix/suffix, addonBefore/After, showCount, `Group`, `Search`, `Password`, `TextArea`                            |
| `InputNumber`    | min/max, step, precision, formatter/parser, controls, keyboard, status                                                                                         |
| `Layout`         | `Header`, `Sider`, `Content`, `Footer`, collapsible sider, breakpoints                                                                                         |
| `List`           | dataSource, renderItem, bordered, grid, pagination, loadMore, `Item`, `Item.Meta`                                                                              |
| `Mentions`       | options, prefix, split, placement, search/select callbacks, `Option`                                                                                           |
| `Menu`           | items, mode, theme, selected/open keys, inline collapse, selectable/multiple, item groups/submenus                                                             |
| `message`        | open, success, error, info, warning, loading, destroy, config, hook/context holder                                                                             |
| `Modal`          | open state, title/content/footer, ok/cancel callbacks, confirm/info/success/error/warning, destroyAll, hook/context holder                                     |
| `notification`   | open, success, error, info, warning, placement, duration, close/destroy, config, hook/context holder                                                           |
| `Pagination`     | current, pageSize, total, size changer, quick jumper, item render, simple/responsive modes                                                                     |
| `Popconfirm`     | title, description, ok/cancel callbacks, placement, trigger, icon, async close                                                                                 |
| `Popover`        | title, content, trigger, placement, open state, arrow, destroy behavior                                                                                        |
| `Progress`       | percent, type, status, stroke, steps, success segment, line/circle/dashboard                                                                                   |
| `QRCode`         | value, canvas/svg type, size, icon, status, error level, refresh callback                                                                                      |
| `Radio`          | checked/value, disabled, option groups, `Button`, `Group`                                                                                                      |
| `Rate`           | value/defaultValue, count, allowHalf, allowClear, character, tooltips                                                                                          |
| `Result`         | status, title, subTitle, icon, extra, presented image constants                                                                                                |
| `Row`            | gutter, align, justify, wrap                                                                                                                                   |
| `Segmented`      | options, value/defaultValue, size, block, disabled, change callback                                                                                            |
| `Select`         | options, value, mode, search/filter, tags/multiple, virtual list, loading, clear, `Option`, `OptGroup`                                                         |
| `Skeleton`       | loading, active animation, avatar/title/paragraph, `Button`, `Input`, `Avatar`, `Image`, `Node`                                                                |
| `Slider`         | value/range, min/max, step, marks, tooltip, vertical/reverse, change callbacks                                                                                 |
| `Space`          | size, direction, align, wrap, split, `Compact`                                                                                                                 |
| `Spin`           | spinning, indicator, tip, delay, size, fullscreen                                                                                                              |
| `Splitter`       | horizontal/vertical layout, panels, size control, collapsible/resizable panels                                                                                 |
| `Statistic`      | title, value, precision, prefix/suffix, formatter, `Countdown`                                                                                                 |
| `Steps`          | current, status, direction, items, progress dot, percent, `Step`                                                                                               |
| `Switch`         | checked/defaultChecked, loading, disabled, checked/unchecked children, change/click callbacks                                                                  |
| `Table`          | columns, dataSource, rowKey, pagination, sorting, filtering, selection, expandable rows, summary, sticky/virtual, `Column`, `ColumnGroup`, selection constants |
| `Tabs`           | items, activeKey, type, position, size, editable/add/close, more menu, `TabPane`                                                                               |
| `Tag`            | color, icon, closable, close callback, `CheckableTag`                                                                                                          |
| `TimePicker`     | value/defaultValue, format, disabled time, use12Hours, showNow, `RangePicker`                                                                                  |
| `Timeline`       | items, mode, pending, reverse, custom dot/color, `Item`                                                                                                        |
| `Tooltip`        | title, placement, trigger, open state, color, arrow, destroy behavior                                                                                          |
| `Tour`           | steps, open/current, placement, mask, indicators, close/change callbacks                                                                                       |
| `Transfer`       | dataSource, targetKeys, selectedKeys, render item, search, pagination, oneWay, `Search`, `Operation`, `List`                                                   |
| `Tree`           | treeData, expanded/selected/checked keys, checkable, draggable, async load, virtual, `TreeNode`, `DirectoryTree`                                               |
| `TreeSelect`     | treeData, value, multiple, treeCheckable, search, async load, show checked strategy, `TreeNode`, show constants                                                |
| `Typography`     | text/title/paragraph/link, editable, copyable, ellipsis, keyboard and semantic text states                                                                     |
| `Upload`         | action, fileList, beforeUpload, customRequest, progress, preview/remove, list type, `Dragger`, `LIST_IGNORE`                                                   |
| `Watermark`      | text/image content, font, gap, offset, rotate, zIndex, inherit container                                                                                       |

## Ant Design Infrastructure Exports

| Export              | Feature API to Implement                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| `theme`             | token access, algorithms, global token shape, component token mapping          |
| `version`           | package version export                                                         |
| `unstableSetRender` | React render override compatibility export                                     |
| Utility types       | `GetProps`, `GetRef`, `GetProp`, `Breakpoint`, and public component prop types |

## DuskMoon-Prefixed Workflow Components

These map z-design `Z*`/`z-*` concepts to DuskMoon `Dm*`/`dm-*` public APIs.

| Target Component        | Source Reference         | Feature API to Implement                                                                             |
| ----------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `DmProvider`            | `CustomConfigProvider`   | prefix/theme/locale provider, service holders, token bridge, theme update callbacks                  |
| `getDmTheme`            | `getZDesignTheme`        | current DuskMoon component theme config derived from design tokens                                   |
| `onDmThemeUpdate`       | `onThemeUpdate`          | subscribe/unsubscribe API for provider theme changes                                                 |
| `setDmPrefixCls`        | `setZDesignPrefixCls`    | update runtime class prefix when compatibility mode needs it                                         |
| `setDmPrimaryColor`     | `setZDesignPrimaryColor` | update runtime primary color/token bridge state                                                      |
| `DmLayout`              | `ZLayout`                | app shell, sider/header/content layout, menu integration, breadcrumb integration, collapsed state    |
| `DmMenu`                | `ZMenu`                  | `IMenu` schema, selected/open keys, sub-router filtering, icons, controlled/uncontrolled state       |
| `DmBreadcrumb`          | `ZBreadcrumb`            | menu-derived breadcrumbs, history storage, dropdown menus, custom home/item rendering                |
| `DmAuxiliary`           | `ZAuxiliary`             | auxiliary/help panel, HTML content rendering policy, close/hide behavior                             |
| `DmQuery`               | `ZQuery`                 | query form schema, imperative ref methods, input/select/date field mapping                           |
| `DmSearch`              | `ZSearch`                | search item schema, compact/collapsed modes, fast filters, date ranges, search/reset callbacks       |
| `DmDrawer`              | `ZDrawer`                | custom drawer close/footer behavior, submit/cancel actions, inherited drawer props                   |
| `DmTable`               | `ZTable`                 | search + table composition, derived search items, column settings, pagination, page-size persistence |
| `usePersistedPageSize`  | `usePersistedPageSize`   | local page-size persistence with `_pageSize` suffix                                                  |
| `DmPagination`          | `ZPagination`            | pagination display wrapper, page-size behavior, locale-aware labels                                  |
| `DmDatePicker`          | `ZDatePicker`            | default formats, range/month/year/week pickers, moment/dayjs conversion semantics                    |
| `setDmDatePickerLocale` | `setZDatePickerLocale`   | date picker locale setter mapped to the DuskMoon public API                                          |
| `DmProTable`            | `ZProTable`              | ag-grid style table API, Ant-style column conversion, toolbar, persisted column state                |
| `DmTree`                | `ZTree`                  | common tree and option/tab tree modes, toolbar, empty state, auto/fixed width behavior               |
| `DmTabs`                | `ZTabs`                  | tabs wrapper, item normalization, z-design tab behavior mapped to DuskMoon styling                   |
| `DmMessage`             | `ZMessage`               | message rendering surface, service API integration, DuskMoon provider context                        |
| `DmPageHeader`          | `ZPageHeader`            | title/subtitle, toolbar integration, back action, title form content                                 |
| `DmSplitter`            | `ZSplitter`              | `DmSplitter.Panel`, resizable panels, collapse/reset, flat mode, local/network persistence           |
| `DmTruncate`            | `ZTruncate`              | measurement, tooltip, copy action, rows/width behavior, i18n strings                                 |
| `DmInfiniteScroll`      | `ZInfiniteScroll`        | scroll target, load-more trigger, loading/end states                                                 |
| `DmStatus`              | `ZStatus`                | loading/empty/error/success state rendering, spin props, retry/action slots                          |
| `DmToolbar`             | `ZToolbar`               | primary action preservation, secondary overflow menu, resize observer behavior                       |

## Internal Implementation Targets

These are not primary public exports unless a later design decision promotes
them.

| Internal Target      | Source Reference    | Purpose                                       |
| -------------------- | ------------------- | --------------------------------------------- |
| `dm-pro-table-inner` | `z-pro-table-inner` | internal engine layer for `DmProTable` parity |

## Shared Feature Requirements

- Forward refs for focusable or imperative components.
- Support controlled and uncontrolled state where the reference API supports it.
- Provide keyboard and screen-reader behavior for interactive components.
- Cover portals and overlay lifecycles for modal, drawer, popover, tooltip,
  dropdown, select, picker, message, notification, and tour-like APIs.
- Preserve static members and constants where they are part of the public API.
- Keep docs and tests aligned with the API surface in this inventory.
