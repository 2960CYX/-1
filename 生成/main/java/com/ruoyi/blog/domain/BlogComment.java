package com.ruoyi.blog.domain;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 博客评论对象 blog_comment
 * 
 * @author CYX
 * @date 2025-10-31
 */
public class BlogComment extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 评论ID */
    private Long commentId;

    /** 文章ID (关联 blog_article.article_id) */
    @Excel(name = "文章ID (关联 blog_article.article_id)")
    private Long articleId;

    /** 评论用户ID (关联 sys_user.user_id, 可为空) */
    @Excel(name = "评论用户ID (关联 sys_user.user_id, 可为空)")
    private Long userId;

    /** 评论人昵称 (游客或用户昵称) */
    @Excel(name = "评论人昵称 (游客或用户昵称)")
    private String nickname;

    /** 评论人邮箱 */
    @Excel(name = "评论人邮箱")
    private String email;

    /** 评论内容 */
    private String content;

    /** 父评论ID (0=对文章的评论, &gt;0=回复某条评论) */
    @Excel(name = "父评论ID (0=对文章的评论, &gt;0=回复某条评论)")
    private Long parentId;

    /** 状态 (0=待审核, 1=已显示) */
    @Excel(name = "状态 (0=待审核, 1=已显示)")
    private String status;

    /** 删除标志 (0=存在, 2=删除) */
    private String delFlag;

    public void setCommentId(Long commentId) 
    {
        this.commentId = commentId;
    }

    public Long getCommentId() 
    {
        return commentId;
    }

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

    public void setNickname(String nickname) 
    {
        this.nickname = nickname;
    }

    public String getNickname() 
    {
        return nickname;
    }

    public void setEmail(String email) 
    {
        this.email = email;
    }

    public String getEmail() 
    {
        return email;
    }

    public void setContent(String content) 
    {
        this.content = content;
    }

    public String getContent() 
    {
        return content;
    }

    public void setParentId(Long parentId) 
    {
        this.parentId = parentId;
    }

    public Long getParentId() 
    {
        return parentId;
    }

    public void setStatus(String status) 
    {
        this.status = status;
    }

    public String getStatus() 
    {
        return status;
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
            .append("commentId", getCommentId())
            .append("articleId", getArticleId())
            .append("userId", getUserId())
            .append("nickname", getNickname())
            .append("email", getEmail())
            .append("content", getContent())
            .append("parentId", getParentId())
            .append("status", getStatus())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .toString();
    }
}
