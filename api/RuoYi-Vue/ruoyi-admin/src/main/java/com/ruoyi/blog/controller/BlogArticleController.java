package com.ruoyi.blog.controller;

import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.util.StringUtils;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.blog.domain.BlogArticle;
import com.ruoyi.blog.service.IBlogArticleService;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.utils.SecurityUtils;

/**
 * 博客文章Controller
 * 
 * @author CYX
 * @date 2025-10-31
 */
@RestController
@RequestMapping("/blog/article")
public class BlogArticleController extends BaseController
{
    @Autowired
    private IBlogArticleService blogArticleService;

    /**
     * 查询博客文章列表
     */
    // @PreAuthorize("@ss.hasPermi('blog:article:list')")
    @GetMapping("/list")
    public TableDataInfo list(BlogArticle blogArticle, Long tagId)
    {
        // 访客默认只展示已发布且未删除的文章，后台可通过显式参数覆盖
        Authentication authentication = SecurityUtils.getAuthentication();
        boolean anonymous = authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken;
        if (anonymous && !StringUtils.hasText(blogArticle.getStatus()))
        {
            blogArticle.setStatus("1");
        }
        if (!StringUtils.hasText(blogArticle.getDelFlag()))
        {
            blogArticle.setDelFlag("0");
        }
        if (tagId != null)
        {
            blogArticle.getParams().put("tagId", tagId);
        }
        startPage();
        List<BlogArticle> list = blogArticleService.selectBlogArticleList(blogArticle);
        return getDataTable(list);
    }

    /**
     * 导出博客文章列表
     */
    @PreAuthorize("@ss.hasPermi('blog:article:export')")
    @Log(title = "博客文章", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, BlogArticle blogArticle)
    {
        List<BlogArticle> list = blogArticleService.selectBlogArticleList(blogArticle);
        ExcelUtil<BlogArticle> util = new ExcelUtil<BlogArticle>(BlogArticle.class);
        util.exportExcel(response, list, "博客文章数据");
    }

    /**
     * 获取博客文章详细信息
     */
    // @PreAuthorize("@ss.hasPermi('blog:article:query')")
    @GetMapping(value = "/{articleId}")
    public AjaxResult getInfo(@PathVariable("articleId") Long articleId)
    {
        BlogArticle article = blogArticleService.selectBlogArticleByArticleId(articleId);
        Authentication authentication = SecurityUtils.getAuthentication();
        boolean anonymous = authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken;
        if (anonymous)
        {
            // 访客仅可查看已发布且未删除的文章
            if (article == null || "0".equals(article.getDelFlag()) == false || "1".equals(article.getStatus()) == false)
            {
                return AjaxResult.error("文章未发布或已删除");
            }
        }
        return success(article);
    }

    /**
     * 新增博客文章
     */
    @PreAuthorize("@ss.hasPermi('blog:article:add')")
    @Log(title = "博客文章", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody BlogArticle blogArticle)
    {
        return toAjax(blogArticleService.insertBlogArticle(blogArticle));
    }

    /**
     * 修改博客文章
     */
    @PreAuthorize("@ss.hasPermi('blog:article:edit')")
    @Log(title = "博客文章", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody BlogArticle blogArticle)
    {
        return toAjax(blogArticleService.updateBlogArticle(blogArticle));
    }

    /**
     * 删除博客文章
     */
    @PreAuthorize("@ss.hasPermi('blog:article:remove')")
    @Log(title = "博客文章", businessType = BusinessType.DELETE)
	@DeleteMapping("/{articleIds}")
    public AjaxResult remove(@PathVariable Long[] articleIds)
    {
        return toAjax(blogArticleService.deleteBlogArticleByArticleIds(articleIds));
    }
}
