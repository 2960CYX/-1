package com.ruoyi.blog.domain;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 博客文章对象 blog_article
 * 
 * @author CYX
 * @date 2025-10-31
 */
public class BlogArticle extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 文章ID */
    private Long articleId;

    /** 作者ID (关联 sys_user.user_id) */
    @Excel(name = "作者ID (关联 sys_user.user_id)")
    private Long userId;

    /** 分类ID (关联 blog_category.category_id) */
    @Excel(name = "分类ID (关联 blog_category.category_id)")
    private Long categoryId;

    /** 文章标题 */
    @Excel(name = "文章标题")
    private String title;

    /** 文章摘要 */
    @Excel(name = "文章摘要")
    private String summary;

    /** 文章内容 (Markdown 或 HTML) */
    private String content;

    /** 封面图片地址 */
    @Excel(name = "封面图片地址")
    private String coverImageUrl;

    /** 状态 (0=草稿, 1=已发布) */
    @Excel(name = "状态 (0=草稿, 1=已发布)")
    private String status;

    /** 是否允许评论 (0=不允许, 1=允许) */
    @Excel(name = "是否允许评论 (0=不允许, 1=允许)")
    private String allowComment;

    /** 浏览量 */
    @Excel(name = "浏览量")
    private Long viewCount;

    /** 删除标志 (0=存在, 2=删除) */
    private String delFlag;

    public void setArticleId(Long articleId) 
    {
        this.articleId = articleId;
    }

    public Long getArticleId() 
    {
        return articleId;
    }

    public void setUserId(Long userId) 
    {
        this.userId = userId;
    }

    public Long getUserId() 
    {
        return userId;
    }

    public void setCategoryId(Long categoryId) 
    {
        this.categoryId = categoryId;
    }

    public Long getCategoryId() 
    {
        return categoryId;
    }

    public void setTitle(String title) 
    {
        this.title = title;
    }

    public String getTitle() 
    {
        return title;
    }

    public void setSummary(String summary) 
    {
        this.summary = summary;
    }

    public String getSummary() 
    {
        return summary;
    }

    public void setContent(String content) 
    {
        this.content = content;
    }

    public String getContent() 
    {
        return content;
    }

    public void setCoverImageUrl(String coverImageUrl) 
    {
        this.coverImageUrl = coverImageUrl;
    }

    public String getCoverImageUrl() 
    {
        return coverImageUrl;
    }

    public void setStatus(String status) 
    {
        this.status = status;
    }

    public String getStatus() 
    {
        return status;
    }

    public void setAllowComment(String allowComment) 
    {
        this.allowComment = allowComment;
    }

    public String getAllowComment() 
    {
        return allowComment;
    }

    public void setViewCount(Long viewCount) 
    {
        this.viewCount = viewCount;
    }

    public Long getViewCount() 
    {
        return viewCount;
    }

    public void setDelFlag(String delFlag) 
    {
        this.delFlag = delFlag;
    }

    public String getDelFlag() 
    {
        return delFlag;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("articleId", getArticleId())
            .append("userId", getUserId())
            .append("categoryId", getCategoryId())
            .append("title", getTitle())
            .append("summary", getSummary())
            .append("content", getContent())
            .append("coverImageUrl", getCoverImageUrl())
            .append("status", getStatus())
            .append("allowComment", getAllowComment())
            .append("viewCount", getViewCount())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
