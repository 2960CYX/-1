package com.ruoyi.blog.mapper;

import java.util.List;
import com.ruoyi.blog.domain.BlogComment;

/**
 * 博客评论Mapper接口
 * 
 * @author CYX
 * @date 2025-10-31
 */
public interface BlogCommentMapper 
{
    /**
     * 查询博客评论
     * 
     * @param commentId 博客评论主键
     * @return 博客评论
     */
    public BlogComment selectBlogCommentByCommentId(Long commentId);

    /**
     * 查询博客评论列表
     * 
     * @param blogComment 博客评论
     * @return 博客评论集合
     */
    public List<BlogComment> selectBlogCommentList(BlogComment blogComment);

    /**
     * 新增博客评论
     * 
     * @param blogComment 博客评论
     * @return 结果
     */
    public int insertBlogComment(BlogComment blogComment);

    /**
     * 修改博客评论
     * 
     * @param blogComment 博客评论
     * @return 结果
     */
    public int updateBlogComment(BlogComment blogComment);

    /**
     * 删除博客评论
     * 
     * @param commentId 博客评论主键
     * @return 结果
     */
    public int deleteBlogCommentByCommentId(Long commentId);

    /**
     * 批量删除博客评论
     * 
     * @param commentIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBlogCommentByCommentIds(Long[] commentIds);
}
