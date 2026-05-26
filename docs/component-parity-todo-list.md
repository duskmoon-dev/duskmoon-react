# Component Todo & API List

Generated from parity manifest and component-api-inventory.

Source of record: `packages/components/scripts/parity/component-api.manifest.json`

## Public Targets

| Status | Kind | Source | Target Id | Export | API Feature |
| --- | --- | --- | --- | --- | --- |

### ant-compatible-component
| [x] | ant-compatible-component | antd | `affix` | `Affix` | offset top/bottom, scroll target, fixed state change callback, ref |
| [x] | ant-compatible-component | antd | `alert` | `Alert` | type/status, closable, banner, icon, action, description, `ErrorBoundary` |
| [x] | ant-compatible-component | antd | `anchor` | `Anchor` | items/links, target container, bounds/offset, active link, click/change callbacks |
| [x] | ant-compatible-component | antd | `app` | `App` | app-level message/notification/modal context, `useApp`-style access |
| [x] | ant-compatible-component | antd | `auto-complete` | `AutoComplete` | options, value/defaultValue, search/select/change callbacks, filtering, `Option` |
| [x] | ant-compatible-component | antd | `avatar` | `Avatar` | size, shape, src/srcSet, icon, alt, fallback children, `Group` |
| [x] | ant-compatible-component | antd | `back-top` | `BackTop` | visibility height, target container, click callback, custom child |
| [x] | ant-compatible-component | antd | `badge` | `Badge` | count, dot, status, color, text, overflow count, offset, `Ribbon` |
| [x] | ant-compatible-component | antd | `breadcrumb` | `Breadcrumb` | items, separators, menu items, item render, route-style data |
| [x] | ant-compatible-component | antd | `button` | `Button` | type/color/variant, size, shape, icon, loading, disabled, block, link/href, `Group` |
| [x] | ant-compatible-component | antd | `calendar` | `Calendar` | value/defaultValue, mode, fullscreen, date/month cell render, select/panel callbacks |
| [x] | ant-compatible-component | antd | `card` | `Card` | title, extra, cover, actions, loading, hoverable, tab list, `Grid`, `Meta` |
| [x] | ant-compatible-component | antd | `carousel` | `Carousel` | autoplay, arrows/dots, effect, speed, before/after change callbacks |
| [x] | ant-compatible-component | antd | `cascader` | `Cascader` | options, value, multiple, search, display render, lazy loading, `Panel`, show constants |
| [x] | ant-compatible-component | antd | `checkbox` | `Checkbox` | checked/defaultChecked, indeterminate, disabled, change callback, `Group` options |
| [x] | ant-compatible-component | antd | `col` | `Col` | span, offset, order, push/pull, breakpoint props |
| [x] | ant-compatible-component | antd | `collapse` | `Collapse` | items, active keys, accordion, bordered/ghost, expand icon, `Panel` |
| [x] | ant-compatible-component | antd | `color-picker` | `ColorPicker` | value/defaultValue, format, presets, trigger, show text, change callbacks |
| [x] | ant-compatible-component | antd | `config-provider` | `ConfigProvider` | theme, locale, prefix, popup container, render empty, direction, virtual/wave config |
| [x] | ant-compatible-component | antd | `date-picker` | `DatePicker` | value, picker modes, format, show time, disabled date/time, presets, `RangePicker`, `WeekPicker`, `MonthPicker`, `QuarterPicker`, `YearPicker` |
| [x] | ant-compatible-component | antd | `descriptions` | `Descriptions` | items, bordered, size, column, layout, label/content style, `Item` |
| [x] | ant-compatible-component | antd | `divider` | `Divider` | horizontal/vertical type, orientation, plain, dashed |
| [x] | ant-compatible-component | antd | `drawer` | `Drawer` | open state, placement, size, title, extra/footer, close, container, loading/destroy behavior |
| [x] | ant-compatible-component | antd | `dropdown` | `Dropdown` | menu, trigger, placement, open state, arrow, destroy behavior, `Button` |
| [x] | ant-compatible-component | antd | `empty` | `Empty` | image, description, custom children, presented image constants |
| [x] | ant-compatible-component | antd | `flex` | `Flex` | align, justify, gap, vertical, wrap, flex children layout |
| [x] | ant-compatible-component | antd | `float-button` | `FloatButton` | icon, type, shape, tooltip, description, badge, `Group`, `BackTop` |
| [x] | ant-compatible-component | antd | `form` | `Form` | form instance, layout, fields, validation rules, dependencies, submit/reset, `Item`, `List`, `ErrorList`, `Provider` |
| [x] | ant-compatible-component | antd | `grid` | `Grid` | breakpoint hooks and responsive utilities |
| [x] | ant-compatible-component | antd | `image` | `Image` | src, preview, fallback, placeholder, toolbar operations, `PreviewGroup` |
| [x] | ant-compatible-component | antd | `input` | `Input` | value/defaultValue, size/status, allowClear, prefix/suffix, addonBefore/After, showCount, `Group`, `Search`, `Password`, `TextArea` |
| [x] | ant-compatible-component | antd | `input-number` | `InputNumber` | min/max, step, precision, formatter/parser, controls, keyboard, status |
| [x] | ant-compatible-component | antd | `layout` | `Layout` | `Header`, `Sider`, `Content`, `Footer`, collapsible sider, breakpoints |
| [x] | ant-compatible-component | antd | `list` | `List` | dataSource, renderItem, bordered, grid, pagination, loadMore, `Item`, `Item.Meta` |
| [x] | ant-compatible-component | antd | `mentions` | `Mentions` | options, prefix, split, placement, search/select callbacks, `Option` |
| [x] | ant-compatible-component | antd | `menu` | `Menu` | items, mode, theme, selected/open keys, inline collapse, selectable/multiple, item groups/submenus |
| [x] | ant-compatible-component | antd | `message` | `message` | open, success, error, info, warning, loading, destroy, config, hook/context holder |
| [x] | ant-compatible-component | antd | `modal` | `Modal` | open state, title/content/footer, ok/cancel callbacks, confirm/info/success/error/warning, destroyAll, hook/context holder |
| [x] | ant-compatible-component | antd | `notification` | `notification` | open, success, error, info, warning, placement, duration, close/destroy, config, hook/context holder |
| [x] | ant-compatible-component | antd | `pagination` | `Pagination` | current, pageSize, total, size changer, quick jumper, item render, simple/responsive modes |
| [x] | ant-compatible-component | antd | `popconfirm` | `Popconfirm` | title, description, ok/cancel callbacks, placement, trigger, icon, async close |
| [x] | ant-compatible-component | antd | `popover` | `Popover` | title, content, trigger, placement, open state, arrow, destroy behavior |
| [x] | ant-compatible-component | antd | `progress` | `Progress` | percent, type, status, stroke, steps, success segment, line/circle/dashboard |
| [x] | ant-compatible-component | antd | `qr-code` | `QRCode` | value, canvas/svg type, size, icon, status, error level, refresh callback |
| [x] | ant-compatible-component | antd | `radio` | `Radio` | checked/value, disabled, option groups, `Button`, `Group` |
| [x] | ant-compatible-component | antd | `rate` | `Rate` | value/defaultValue, count, allowHalf, allowClear, character, tooltips |
| [x] | ant-compatible-component | antd | `result` | `Result` | status, title, subTitle, icon, extra, presented image constants |
| [x] | ant-compatible-component | antd | `row` | `Row` | gutter, align, justify, wrap |
| [x] | ant-compatible-component | antd | `segmented` | `Segmented` | options, value/defaultValue, size, block, disabled, change callback |
| [x] | ant-compatible-component | antd | `select` | `Select` | options, value, mode, search/filter, tags/multiple, virtual list, loading, clear, `Option`, `OptGroup` |
| [x] | ant-compatible-component | antd | `skeleton` | `Skeleton` | loading, active animation, avatar/title/paragraph, `Button`, `Input`, `Avatar`, `Image`, `Node` |
| [x] | ant-compatible-component | antd | `slider` | `Slider` | value/range, min/max, step, marks, tooltip, vertical/reverse, change callbacks |
| [x] | ant-compatible-component | antd | `space` | `Space` | size, direction, align, wrap, split, `Compact` |
| [x] | ant-compatible-component | antd | `spin` | `Spin` | spinning, indicator, tip, delay, size, fullscreen |
| [x] | ant-compatible-component | antd | `splitter` | `Splitter` | horizontal/vertical layout, panels, size control, collapsible/resizable panels |
| [x] | ant-compatible-component | antd | `statistic` | `Statistic` | title, value, precision, prefix/suffix, formatter, `Countdown` |
| [x] | ant-compatible-component | antd | `steps` | `Steps` | current, status, direction, items, progress dot, percent, `Step` |
| [x] | ant-compatible-component | antd | `switch` | `Switch` | checked/defaultChecked, loading, disabled, checked/unchecked children, change/click callbacks |
| [x] | ant-compatible-component | antd | `table` | `Table` | columns, dataSource, rowKey, pagination, sorting, filtering, selection, expandable rows, summary, sticky/virtual, `Column`, `ColumnGroup`, selection constants |
| [x] | ant-compatible-component | antd | `tabs` | `Tabs` | items, activeKey, type, position, size, editable/add/close, more menu, `TabPane` |
| [x] | ant-compatible-component | antd | `tag` | `Tag` | color, icon, closable, close callback, `CheckableTag` |
| [x] | ant-compatible-component | antd | `time-picker` | `TimePicker` | value/defaultValue, format, disabled time, use12Hours, showNow, `RangePicker` |
| [x] | ant-compatible-component | antd | `timeline` | `Timeline` | items, mode, pending, reverse, custom dot/color, `Item` |
| [x] | ant-compatible-component | antd | `tooltip` | `Tooltip` | title, placement, trigger, open state, color, arrow, destroy behavior |
| [x] | ant-compatible-component | antd | `tour` | `Tour` | steps, open/current, placement, mask, indicators, close/change callbacks |
| [x] | ant-compatible-component | antd | `transfer` | `Transfer` | dataSource, targetKeys, selectedKeys, render item, search, pagination, oneWay, `Search`, `Operation`, `List` |
| [x] | ant-compatible-component | antd | `tree` | `Tree` | treeData, expanded/selected/checked keys, checkable, draggable, async load, virtual, `TreeNode`, `DirectoryTree` |
| [x] | ant-compatible-component | antd | `tree-select` | `TreeSelect` | treeData, value, multiple, treeCheckable, search, async load, show checked strategy, `TreeNode`, show constants |
| [x] | ant-compatible-component | antd | `typography` | `Typography` | text/title/paragraph/link, editable, copyable, ellipsis, keyboard and semantic text states |
| [x] | ant-compatible-component | antd | `upload` | `Upload` | action, fileList, beforeUpload, customRequest, progress, preview/remove, list type, `Dragger`, `LIST_IGNORE` |
| [x] | ant-compatible-component | antd | `watermark` | `Watermark` | text/image content, font, gap, offset, rotate, zIndex, inherit container |

### dm-workflow-component
| [x] | dm-workflow-component | ZAuxiliary | `dm-auxiliary` | `DmAuxiliary` | `ZAuxiliary` |
| [x] | dm-workflow-component | ZBreadcrumb | `dm-breadcrumb` | `DmBreadcrumb` | `ZBreadcrumb` |
| [x] | dm-workflow-component | ZDatePicker | `dm-date-picker` | `DmDatePicker` | `ZDatePicker` |
| [x] | dm-workflow-component | ZDrawer | `dm-drawer` | `DmDrawer` | `ZDrawer` |
| [x] | dm-workflow-component | ZInfiniteScroll | `dm-infinite-scroll` | `DmInfiniteScroll` | `ZInfiniteScroll` |
| [x] | dm-workflow-component | ZLayout | `dm-layout` | `DmLayout` | `ZLayout` |
| [x] | dm-workflow-component | ZMenu | `dm-menu` | `DmMenu` | `ZMenu` |
| [x] | dm-workflow-component | ZMessage | `dm-message` | `DmMessage` | `ZMessage` |
| [x] | dm-workflow-component | ZPageHeader | `dm-page-header` | `DmPageHeader` | `ZPageHeader` |
| [x] | dm-workflow-component | ZPagination | `dm-pagination` | `DmPagination` | `ZPagination` |
| [x] | dm-workflow-component | ZProTable | `dm-pro-table` | `DmProTable` | `ZProTable` |
| [x] | dm-workflow-component | CustomConfigProvider | `dm-provider` | `DmProvider` | `CustomConfigProvider` |
| [x] | dm-workflow-component | ZQuery | `dm-query` | `DmQuery` | `ZQuery` |
| [x] | dm-workflow-component | ZSearch | `dm-search` | `DmSearch` | `ZSearch` |
| [x] | dm-workflow-component | ZSplitter | `dm-splitter` | `DmSplitter` | `ZSplitter` |
| [x] | dm-workflow-component | ZStatus | `dm-status` | `DmStatus` | `ZStatus` |
| [x] | dm-workflow-component | ZTable | `dm-table` | `DmTable` | `ZTable` |
| [x] | dm-workflow-component | ZTabs | `dm-tabs` | `DmTabs` | `ZTabs` |
| [x] | dm-workflow-component | ZToolbar | `dm-toolbar` | `DmToolbar` | `ZToolbar` |
| [x] | dm-workflow-component | ZTree | `dm-tree` | `DmTree` | `ZTree` |
| [x] | dm-workflow-component | ZTruncate | `dm-truncate` | `DmTruncate` | `ZTruncate` |

### infrastructure-export
| [x] | infrastructure-export | antd | `breakpoint` | `Breakpoint` | See component-api-inventory.md |
| [x] | infrastructure-export | getZDesignTheme | `get-dm-theme` | `getDmTheme` | `getZDesignTheme` |
| [x] | infrastructure-export | antd | `get-prop` | `GetProp` | See component-api-inventory.md |
| [x] | infrastructure-export | antd | `get-props` | `GetProps` | See component-api-inventory.md |
| [x] | infrastructure-export | antd | `get-ref` | `GetRef` | See component-api-inventory.md |
| [x] | infrastructure-export | onThemeUpdate | `on-dm-theme-update` | `onDmThemeUpdate` | `onThemeUpdate` |
| [x] | infrastructure-export | setZDatePickerLocale | `set-dm-date-picker-locale` | `setDmDatePickerLocale` | `setZDatePickerLocale` |
| [x] | infrastructure-export | setZDesignPrefixCls | `set-dm-prefix-cls` | `setDmPrefixCls` | `setZDesignPrefixCls` |
| [x] | infrastructure-export | setZDesignPrimaryColor | `set-dm-primary-color` | `setDmPrimaryColor` | `setZDesignPrimaryColor` |
| [x] | infrastructure-export | antd | `theme` | `theme` | token access, algorithms, global token shape, component token mapping |
| [x] | infrastructure-export | antd | `unstable-set-render` | `unstableSetRender` | React render override compatibility export |
| [x] | infrastructure-export | ZTable | `use-persisted-page-size` | `usePersistedPageSize` | `usePersistedPageSize` |
| [x] | infrastructure-export | antd | `version` | `version` | package version export |

## Internal Targets

- [x] `dm-pro-table-inner`
