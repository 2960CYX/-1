-- 菜单 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客标签', '2000', '1', 'tag', 'blog/tag/index', 1, 0, 'C', '0', '0', 'blog:tag:list', '#', 'admin', sysdate(), '', null, '博客标签菜单');

-- 按钮父菜单ID
SELECT @parentId := LAST_INSERT_ID();

-- 按钮 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客标签查询', @parentId, '1',  '#', '', 1, 0, 'F', '0', '0', 'blog:tag:query',        '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客标签新增', @parentId, '2',  '#', '', 1, 0, 'F', '0', '0', 'blog:tag:add',          '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客标签修改', @parentId, '3',  '#', '', 1, 0, 'F', '0', '0', 'blog:tag:edit',         '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客标签删除', @parentId, '4',  '#', '', 1, 0, 'F', '0', '0', 'blog:tag:remove',       '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客标签导出', @parentId, '5',  '#', '', 1, 0, 'F', '0', '0', 'blog:tag:export',       '#', 'admin', sysdate(), '', null, '');