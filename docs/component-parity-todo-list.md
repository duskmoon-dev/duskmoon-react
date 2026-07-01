# Component Todo & API List

Generated from parity manifest and component-api-inventory.

Source of record: `packages/components/scripts/parity/component-api.manifest.json`

## Public Targets

| Status | Kind | Source | Target Id | Export | API Feature |
| ------ | ---- | ------ | --------- | ------ | ----------- |

### standard-component

| [x] | standard-component | duskmoon | `affix` | `Affix` | offset top/bottom, scroll target, fixed state change callback, ref |
| [x] | standard-component | duskmoon | `alert` | `Alert` | type/status, closable, banner, icon, action, description, `ErrorBoundary` |
| [x] | standard-component | duskmoon | `anchor` | `Anchor` | items/links, target container, bounds/offset, active link, click/change callbacks |
| [x] | standard-component | duskmoon | `app` | `App` | app-level message/notification/modal context, `useApp`-style access |
| [x] | standard-component | duskmoon | `auto-complete` | `AutoComplete` | options, value/defaultValue, search/select/change callbacks, filtering, `Option` |
| [x] | standard-component | duskmoon | `avatar` | `Avatar` | size, shape, src/srcSet, icon, alt, fallback children, `Group` |
| [x] | standard-component | duskmoon | `back-top` | `BackTop` | visibility height, target container, click callback, custom child |
| [x] | standard-component | duskmoon | `badge` | `Badge` | count, dot, status, color, text, overflow count, offset, `Ribbon` |
| [x] | standard-component | duskmoon | `breadcrumb` | `Breadcrumb` | items, separators, menu items, item render, route-style data |
| [x] | standard-component | duskmoon | `button` | `Button` | type/color/variant, size, shape, icon, loading, disabled, block, link/href, `Group` |
| [x] | standard-component | duskmoon | `calendar` | `Calendar` | value/defaultValue, mode, fullscreen, date/month cell render, select/panel callbacks |
| [x] | standard-component | duskmoon | `card` | `Card` | title, extra, cover, actions, loading, hoverable, tab list, `Grid`, `Meta` |
| [x] | standard-component | duskmoon | `carousel` | `Carousel` | autoplay, arrows/dots, effect, speed, before/after change callbacks |
| [x] | standard-component | duskmoon | `cascader` | `Cascader` | options, value, multiple, search, display render, lazy loading, `Panel`, show constants |
| [x] | standard-component | duskmoon | `checkbox` | `Checkbox` | checked/defaultChecked, indeterminate, disabled, change callback, `Group` options |
| [x] | standard-component | duskmoon | `col` | `Col` | span, offset, order, push/pull, breakpoint props |
| [x] | standard-component | duskmoon | `collapse` | `Collapse` | items, active keys, accordion, bordered/ghost, expand icon, `Panel` |
| [x] | standard-component | duskmoon | `color-picker` | `ColorPicker` | value/defaultValue, format, presets, trigger, show text, change callbacks |
| [x] | standard-component | duskmoon | `config-provider` | `ConfigProvider` | theme, locale, prefix, popup container, render empty, direction, virtual/wave config |
| [x] | standard-component | duskmoon | `date-picker` | `DatePicker` | value, picker modes, format, show time, disabled date/time, presets, `RangePicker`, `WeekPicker`, `MonthPicker`, `QuarterPicker`, `YearPicker` |
| [x] | standard-component | duskmoon | `descriptions` | `Descriptions` | items, bordered, size, column, layout, label/content style, `Item` |
| [x] | standard-component | duskmoon | `divider` | `Divider` | horizontal/vertical type, orientation, plain, dashed |
| [x] | standard-component | duskmoon | `drawer` | `Drawer` | open state, placement, size, title, extra/footer, close, container, loading/destroy behavior |
| [x] | standard-component | duskmoon | `dropdown` | `Dropdown` | menu, trigger, placement, open state, arrow, destroy behavior, `Button` |
| [x] | standard-component | duskmoon | `empty` | `Empty` | image, description, custom children, presented image constants |
| [x] | standard-component | duskmoon | `flex` | `Flex` | align, justify, gap, vertical, wrap, flex children layout |
| [x] | standard-component | duskmoon | `float-button` | `FloatButton` | icon, type, shape, tooltip, description, badge, `Group`, `BackTop` |
| [x] | standard-component | duskmoon | `form` | `Form` | form instance, layout, fields, validation rules, dependencies, submit/reset, `Item`, `List`, `ErrorList`, `Provider` |
| [x] | standard-component | duskmoon | `grid` | `Grid` | breakpoint hooks and responsive utilities |
| [x] | standard-component | duskmoon | `image` | `Image` | src, preview, fallback, placeholder, toolbar operations, `PreviewGroup` |
| [x] | standard-component | duskmoon | `input` | `Input` | value/defaultValue, size/status, allowClear, prefix/suffix, addonBefore/After, showCount, `Group`, `Search`, `Password`, `TextArea` |
| [x] | standard-component | duskmoon | `input-number` | `InputNumber` | min/max, step, precision, formatter/parser, controls, keyboard, status |
| [x] | standard-component | duskmoon | `layout` | `Layout` | `Header`, `Sider`, `Content`, `Footer`, collapsible sider, breakpoints |
| [x] | standard-component | duskmoon | `list` | `List` | dataSource, renderItem, bordered, grid, pagination, loadMore, `Item`, `Item.Meta` |
| [x] | standard-component | duskmoon | `mentions` | `Mentions` | options, prefix, split, placement, search/select callbacks, `Option` |
| [x] | standard-component | duskmoon | `menu` | `Menu` | items, mode, theme, selected/open keys, inline collapse, selectable/multiple, item groups/submenus |
| [x] | standard-component | duskmoon | `message` | `message` | open, success, error, info, warning, loading, destroy, config, hook/context holder |
| [x] | standard-component | duskmoon | `modal` | `Modal` | open state, title/content/footer, ok/cancel callbacks, confirm/info/success/error/warning, destroyAll, hook/context holder |
| [x] | standard-component | duskmoon | `notification` | `notification` | open, success, error, info, warning, placement, duration, close/destroy, config, hook/context holder |
| [x] | standard-component | duskmoon | `pagination` | `Pagination` | current, pageSize, total, size changer, quick jumper, item render, simple/responsive modes |
| [x] | standard-component | duskmoon | `popconfirm` | `Popconfirm` | title, description, ok/cancel callbacks, placement, trigger, icon, async close |
| [x] | standard-component | duskmoon | `popover` | `Popover` | title, content, trigger, placement, open state, arrow, destroy behavior |
| [x] | standard-component | duskmoon | `progress` | `Progress` | percent, type, status, stroke, steps, success segment, line/circle/dashboard |
| [x] | standard-component | duskmoon | `qr-code` | `QRCode` | value, canvas/svg type, size, icon, status, error level, refresh callback |
| [x] | standard-component | duskmoon | `radio` | `Radio` | checked/value, disabled, option groups, `Button`, `Group` |
| [x] | standard-component | duskmoon | `rate` | `Rate` | value/defaultValue, count, allowHalf, allowClear, character, tooltips |
| [x] | standard-component | duskmoon | `result` | `Result` | status, title, subTitle, icon, extra, presented image constants |
| [x] | standard-component | duskmoon | `row` | `Row` | gutter, align, justify, wrap |
| [x] | standard-component | duskmoon | `segmented` | `Segmented` | options, value/defaultValue, size, block, disabled, change callback |
| [x] | standard-component | duskmoon | `select` | `Select` | options, value, mode, search/filter, tags/multiple, virtual list, loading, clear, `Option`, `OptGroup` |
| [x] | standard-component | duskmoon | `skeleton` | `Skeleton` | loading, active animation, avatar/title/paragraph, `Button`, `Input`, `Avatar`, `Image`, `Node` |
| [x] | standard-component | duskmoon | `slider` | `Slider` | value/range, min/max, step, marks, tooltip, vertical/reverse, change callbacks |
| [x] | standard-component | duskmoon | `space` | `Space` | size, direction, align, wrap, split, `Compact` |
| [x] | standard-component | duskmoon | `spin` | `Spin` | spinning, indicator, tip, delay, size, fullscreen |
| [x] | standard-component | duskmoon | `splitter` | `Splitter` | horizontal/vertical layout, panels, size control, collapsible/resizable panels |
| [x] | standard-component | duskmoon | `statistic` | `Statistic` | title, value, precision, prefix/suffix, formatter, `Countdown` |
| [x] | standard-component | duskmoon | `steps` | `Steps` | current, status, direction, items, progress dot, percent, `Step` |
| [x] | standard-component | duskmoon | `switch` | `Switch` | checked/defaultChecked, loading, disabled, checked/unchecked children, change/click callbacks |
| [x] | standard-component | duskmoon | `table` | `Table` | columns, dataSource, rowKey, pagination, sorting, filtering, selection, expandable rows, summary, sticky/virtual, `Column`, `ColumnGroup`, selection constants |
| [x] | standard-component | duskmoon | `tabs` | `Tabs` | items, activeKey, type, position, size, editable/add/close, more menu, `TabPane` |
| [x] | standard-component | duskmoon | `tag` | `Tag` | color, icon, closable, close callback, `CheckableTag` |
| [x] | standard-component | duskmoon | `time-picker` | `TimePicker` | value/defaultValue, format, disabled time, use12Hours, showNow, `RangePicker` |
| [x] | standard-component | duskmoon | `timeline` | `Timeline` | items, mode, pending, reverse, custom dot/color, `Item` |
| [x] | standard-component | duskmoon | `tooltip` | `Tooltip` | title, placement, trigger, open state, color, arrow, destroy behavior |
| [x] | standard-component | duskmoon | `tour` | `Tour` | steps, open/current, placement, mask, indicators, close/change callbacks |
| [x] | standard-component | duskmoon | `transfer` | `Transfer` | dataSource, targetKeys, selectedKeys, render item, search, pagination, oneWay, `Search`, `Operation`, `List` |
| [x] | standard-component | duskmoon | `tree` | `Tree` | treeData, expanded/selected/checked keys, checkable, draggable, async load, virtual, `TreeNode`, `DirectoryTree` |
| [x] | standard-component | duskmoon | `tree-select` | `TreeSelect` | treeData, value, multiple, treeCheckable, search, async load, show checked strategy, `TreeNode`, show constants |
| [x] | standard-component | duskmoon | `typography` | `Typography` | text/title/paragraph/link, editable, copyable, ellipsis, keyboard and semantic text states |
| [x] | standard-component | duskmoon | `upload` | `Upload` | action, fileList, beforeUpload, customRequest, progress, preview/remove, list type, `Dragger`, `LIST_IGNORE` |
| [x] | standard-component | duskmoon | `watermark` | `Watermark` | text/image content, font, gap, offset, rotate, zIndex, inherit container |

### dm-workflow-component

| [x] | dm-workflow-component | duskmoon | `dm-auxiliary` | `DmAuxiliary` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-breadcrumb` | `DmBreadcrumb` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-date-picker` | `DmDatePicker` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-drawer` | `DmDrawer` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-infinite-scroll` | `DmInfiniteScroll` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-layout` | `DmLayout` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-menu` | `DmMenu` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-message` | `DmMessage` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-page-header` | `DmPageHeader` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-pagination` | `DmPagination` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-pro-table` | `DmProTable` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-provider` | `DmProvider` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-query` | `DmQuery` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-search` | `DmSearch` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-splitter` | `DmSplitter` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-status` | `DmStatus` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-table` | `DmTable` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-tabs` | `DmTabs` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-toolbar` | `DmToolbar` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-tree` | `DmTree` | See component-api-inventory.md |
| [x] | dm-workflow-component | duskmoon | `dm-truncate` | `DmTruncate` | See component-api-inventory.md |

### infrastructure-export

| [x] | infrastructure-export | duskmoon | `breakpoint` | `Breakpoint` | See component-api-inventory.md |
| [x] | infrastructure-export | duskmoon | `get-dm-theme` | `getDmTheme` | See component-api-inventory.md |
| [x] | infrastructure-export | duskmoon | `get-prop` | `GetProp` | See component-api-inventory.md |
| [x] | infrastructure-export | duskmoon | `get-props` | `GetProps` | See component-api-inventory.md |
| [x] | infrastructure-export | duskmoon | `get-ref` | `GetRef` | See component-api-inventory.md |
| [x] | infrastructure-export | duskmoon | `on-dm-theme-update` | `onDmThemeUpdate` | `onThemeUpdate` |
| [x] | infrastructure-export | duskmoon | `set-dm-date-picker-locale` | `setDmDatePickerLocale` | See component-api-inventory.md |
| [x] | infrastructure-export | duskmoon | `set-dm-prefix-cls` | `setDmPrefixCls` | See component-api-inventory.md |
| [x] | infrastructure-export | duskmoon | `set-dm-primary-color` | `setDmPrimaryColor` | See component-api-inventory.md |
| [x] | infrastructure-export | duskmoon | `theme` | `theme` | token access, algorithms, global token shape, component token mapping |
| [x] | infrastructure-export | duskmoon | `unstable-set-render` | `unstableSetRender` | React render override compatibility export |
| [x] | infrastructure-export | duskmoon | `use-persisted-page-size` | `usePersistedPageSize` | `usePersistedPageSize` |
| [x] | infrastructure-export | duskmoon | `version` | `version` | package version export |
