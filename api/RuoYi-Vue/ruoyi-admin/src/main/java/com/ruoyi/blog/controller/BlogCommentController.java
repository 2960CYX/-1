package com.ruoyi.blog.controller;

import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.blog.domain.BlogComment;
import com.ruoyi.blog.service.IBlogCommentService;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.common.annotation.Anonymous;

/**
 * 博客评论Controller
 * 
 * @author CYX
 * @date 2025-10-31
 */
@RestController
@RequestMapping("/blog/comment")
public class BlogCommentController extends BaseController
{
    @Autowired
    private IBlogCommentService blogCommentService;

    /**
     * 查询博客评论列表
     */
    @Anonymous
    @GetMapping("/list")
    public TableDataInfo list(BlogComment blogComment)
    {
        // 访客默认只展示已显示且未删除的评论，后台可通过显式参数覆盖
        Authentication authentication = SecurityUtils.getAuthentication();
        boolean anonymous = authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken;
        if (anonymous && !StringUtils.hasText(blogComment.getStatus()))
        {
            blogComment.setStatus("1");
        }
        if (!StringUtils.hasText(blogComment.getDelFlag()))
        {
            blogComment.setDelFlag("0");
        }
        startPage();
        List<BlogComment> list = blogCommentService.selectBlogCommentList(blogComment);
        return getDataTable(list);
    }

    /**
     * 导出博客评论列表
     */
    @PreAuthorize("@ss.hasPermi('blog:comment:export')")
    @Log(title = "博客评论", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, BlogComment blogComment)
    {
        List<BlogComment> list = blogCommentService.selectBlogCommentList(blogComment);
        ExcelUtil<BlogComment> util = new ExcelUtil<BlogComment>(BlogComment.class);
        util.exportExcel(response, list, "博客评论数据");
    }

    /**
     * 获取博客评论详细信息
     */
    @PreAuthorize("@ss.hasPermi('blog:comment:query')")
    @GetMapping(value = "/{commentId}")
    public AjaxResult getInfo(@PathVariable("commentId") Long commentId)
    {
        return success(blogCommentService.selectBlogCommentByCommentId(commentId));
    }

    /**
     * 新增博客评论
     */
    @Anonymous
    @Log(title = "博客评论", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody BlogComment blogComment)
    {
        // 绑定当前登录用户信息到评论上
        try {
            Long userId = SecurityUtils.getUserId();
            String nickname = SecurityUtils.getLoginUser().getUser().getNickName();
            if (nickname == null || nickname.trim().isEmpty()) {
                nickname = SecurityUtils.getUsername();
            }
            blogComment.setUserId(userId);
            blogComment.setNickname(nickname);
        } catch (Exception ignored) {
            // 若获取用户信息失败，交由鉴权层返回未授权
        }
        return toAjax(blogCommentService.insertBlogComment(blogComment));
    }

    /**
     * 修改博客评论
     */
    @PreAuthorize("@ss.hasPermi('blog:comment:edit')")
    @Log(title = "博客评论", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody BlogComment blogComment)
    {
        return toAjax(blogCommentService.updateBlogComment(blogComment));
    }

    /**
     * 删除博客评论
     */
    @PreAuthorize("@ss.hasPermi('blog:comment:remove')")
    @Log(title = "博客评论", businessType = BusinessType.DELETE)
	@DeleteMapping("/{commentIds}")
    public AjaxResult remove(@PathVariable Long[] commentIds)
    {
        return toAjax(blogCommentService.deleteBlogCommentByCommentIds(commentIds));
    }
}
