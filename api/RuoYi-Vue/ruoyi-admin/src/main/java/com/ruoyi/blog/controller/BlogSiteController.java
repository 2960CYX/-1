package com.ruoyi.blog.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.domain.AjaxResult;

/**
 * 站点信息公开接口（博客）。
 */
@RestController
@RequestMapping("/blog/site")
public class BlogSiteController {

    /**
     * 获取站点信息（无需登录）。
     */
    @Anonymous
    @GetMapping("/info")
    public AjaxResult getSiteInfo() {
        Map<String, Object> data = new HashMap<>();
        data.put("heroTitle", "简栈 · 以简驭繁的个人博客系统");
        data.put("heroSubtitle", "写给认真经营内容的人");
        data.put("heroDescription", "简栈聚焦内容架构、知识整理与工程策略，让若依后端的真实数据成为轻盈的阅读体验。");
        data.put("heroKicker", "简栈志 · 你的内容生产栈");
        data.put("ctaText", "立即探索");
        data.put("ctaLink", "/article");
        data.put("secondaryCtaText", "关于本站");
        data.put("secondaryCtaLink", "/about");
        data.put("contactEmail", "hello@jianzhansite.com");

        data.put("featuredCategoryIds", List.of());
        data.put("showcaseTagIds", List.of());

        List<Map<String, String>> timeline = new ArrayList<>();
        Map<String, String> t1 = new HashMap<>();
        t1.put("year", "2023");
        t1.put("title", "简栈构想浮现");
        t1.put("description", "提出「以简驭繁」的写作工作流，梳理个人知识栈与前端展现方式。");
        timeline.add(t1);
        Map<String, String> t2 = new HashMap<>();
        t2.put("year", "2024");
        t2.put("title", "与若依后端贯通");
                t2.put("description", "完成文章、分类与标签模块的数据对接，确保管理端与前台体验一致。");
        timeline.add(t2);
        Map<String, String> t3 = new HashMap<>();
        t3.put("year", "2025");
                t3.put("title", "自托管生产可用");
                t3.put("description", "加入权限、通知与缓存策略，让自托管部署也具备可观测性与稳定性。");
        timeline.add(t3);
        data.put("timeline", timeline);

        List<Map<String, String>> principles = new ArrayList<>();
        Map<String, String> p1 = new HashMap<>();
                p1.put("title", "以简为纲");
                p1.put("description", "所有能力围绕写作与发布的关键路径设计，避免多余干扰。");
        principles.add(p1);
        Map<String, String> p2 = new HashMap<>();
                p2.put("title", "数据自洽");
                p2.put("description", "前后端统一字段语义与校验规则，保证内容在任意终端都稳定可用。");
        principles.add(p2);
        Map<String, String> p3 = new HashMap<>();
                p3.put("title", "持续复用");
                p3.put("description", "文章、组件与写作模板都可复用，方便个人长期积累知识资产。");
        principles.add(p3);
        data.put("principles", principles);

        return AjaxResult.success(data);
    }
}
