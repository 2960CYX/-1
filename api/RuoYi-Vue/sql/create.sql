-- 1. 创建数据库
-- 确保数据库不存在时才创建，并设置字符集
CREATE DATABASE IF NOT EXISTS blog_system 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_general_ci;

-- 切换到新创建的数据库
USE blog_system;

-- ----------------------------
-- 2. 博客分类表
-- ----------------------------
DROP TABLE IF EXISTS `blog_category`;
CREATE TABLE `blog_category` (
  `category_id` bigint NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(128) NOT NULL COMMENT '分类名称',
  `description` varchar(512) DEFAULT NULL COMMENT '分类描述',
  `sort` int DEFAULT '0' COMMENT '排序字段',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT='博客分类表';

-- ----------------------------
-- 3. 博客标签表
-- ----------------------------
DROP TABLE IF EXISTS `blog_tag`;
CREATE TABLE `blog_tag` (
  `tag_id` bigint NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `name` varchar(128) NOT NULL COMMENT '标签名称',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `idx_tag_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT='博客标签表';

-- ----------------------------
-- 4. 博客文章表
-- ----------------------------
DROP TABLE IF EXISTS `blog_article`;
CREATE TABLE `blog_article` (
  `article_id` bigint NOT NULL AUTO_INCREMENT COMMENT '文章ID',
  `user_id` bigint NOT NULL COMMENT '作者ID (关联 sys_user.user_id)',
  `category_id` bigint NOT NULL COMMENT '分类ID (关联 blog_category.category_id)',
  `title` varchar(255) NOT NULL COMMENT '文章标题',
  `summary` varchar(1024) DEFAULT NULL COMMENT '文章摘要',
  `content` longtext COMMENT '文章内容 (Markdown 或 HTML)',
  `cover_image_url` varchar(512) DEFAULT NULL COMMENT '封面图片地址',
  `status` char(1) NOT NULL DEFAULT '0' COMMENT '状态 (0=草稿, 1=已发布)',
  `allow_comment` char(1) NOT NULL DEFAULT '1' COMMENT '是否允许评论 (0=不允许, 1=允许)',
  `view_count` int DEFAULT '0' COMMENT '浏览量',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志 (0=存在, 2=删除)',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`article_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category_id` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT='博客文章表';

-- ----------------------------
-- 5. 文章标签关联表 (多对多)
-- ----------------------------
DROP TABLE IF EXISTS `blog_article_tag`;
CREATE TABLE `blog_article_tag` (
  `article_id` bigint NOT NULL COMMENT '文章ID',
  `tag_id` bigint NOT NULL COMMENT '标签ID',
  PRIMARY KEY (`article_id`,`tag_id`)
) ENGINE=InnoDB COMMENT='文章标签关联表';

-- ----------------------------
-- 6. 评论表
-- ----------------------------
DROP TABLE IF EXISTS `blog_comment`;
CREATE TABLE `blog_comment` (
  `comment_id` bigint NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `article_id` bigint NOT NULL COMMENT '文章ID (关联 blog_article.article_id)',
  `user_id` bigint DEFAULT NULL COMMENT '评论用户ID (关联 sys_user.user_id, 可为空)',
  `nickname` varchar(64) NOT NULL COMMENT '评论人昵称 (游客或用户昵称)',
  `email` varchar(128) DEFAULT NULL COMMENT '评论人邮箱',
  `content` text NOT NULL COMMENT '评论内容',
  `parent_id` bigint DEFAULT '0' COMMENT '父评论ID (0=对文章的评论, >0=回复某条评论)',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态 (0=待审核, 1=已显示)',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志 (0=存在, 2=删除)',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`comment_id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT='博客评论表';