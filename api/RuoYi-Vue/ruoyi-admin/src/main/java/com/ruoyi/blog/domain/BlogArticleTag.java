package com.ruoyi.blog.domain;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 博客文章标签关联对象 blog_article_tag
 * 
 * @author CYX
 * @date 2025-10-31
 */
public class BlogArticleTag extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 文章ID */
    private Long articleId;

    /** 标签ID */
    private Long tagId;

    public void setArticleId(Long articleId) 
    {
        this.articleId = articleId;
    }

    public Long getArticleId() 
    {
        return articleId;
    }

    public void setTagId(Long tagId) 
    {
        this.tagId = tagId;
    }

    public Long getTagId() 
    {
        return tagId;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("articleId", getArticleId())
            .append("tagId", getTagId())
            .toString();
    }
}