-- 菜单 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客文章', '2000', '1', 'article', 'blog/article/index', 1, 0, 'C', '0', '0', 'blog:article:list', '#', 'admin', sysdate(), '', null, '博客文章菜单');

-- 按钮父菜单ID
SELECT @parentId := LAST_INSERT_ID();

-- 按钮 SQL
insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客文章查询', @parentId, '1',  '#', '', 1, 0, 'F', '0', '0', 'blog:article:query',        '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客文章新增', @parentId, '2',  '#', '', 1, 0, 'F', '0', '0', 'blog:article:add',          '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客文章修改', @parentId, '3',  '#', '', 1, 0, 'F', '0', '0', 'blog:article:edit',         '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客文章删除', @parentId, '4',  '#', '', 1, 0, 'F', '0', '0', 'blog:article:remove',       '#', 'admin', sysdate(), '', null, '');

insert into sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
values('博客文章导出', @parentId, '5',  '#', '', 1, 0, 'F', '0', '0', 'blog:article:export',       '#', 'admin', sysdate(), '', null, '');