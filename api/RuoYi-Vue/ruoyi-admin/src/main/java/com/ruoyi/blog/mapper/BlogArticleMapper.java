package com.ruoyi.blog.mapper;

import java.util.List;
import com.ruoyi.blog.domain.BlogArticle;
import com.ruoyi.blog.domain.BlogArticleTag;

/**
 * 博客文章Mapper接口
 * 
 * @author CYX
 * @date 2025-10-31
 */
public interface BlogArticleMapper 
{
    /**
     * 查询博客文章
     * 
     * @param articleId 博客文章主键
     * @return 博客文章
     */
    public BlogArticle selectBlogArticleByArticleId(Long articleId);

    /**
     * 查询博客文章列表
     * 
     * @param blogArticle 博客文章
     * @return 博客文章集合
     */
    public List<BlogArticle> selectBlogArticleList(BlogArticle blogArticle);

    /**
     * 新增博客文章
     * 
     * @param blogArticle 博客文章
     * @return 结果
     */
    public int insertBlogArticle(BlogArticle blogArticle);

    /**
     * 修改博客文章
     * 
     * @param blogArticle 博客文章
     * @return 结果
     */
    public int updateBlogArticle(BlogArticle blogArticle);

    /**
     * 删除博客文章
     * 
     * @param articleId 博客文章主键
     * @return 结果
     */
    public int deleteBlogArticleByArticleId(Long articleId);

    /**
     * 批量删除博客文章
     * 
     * @param articleIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBlogArticleByArticleIds(Long[] articleIds);

    /**
     * 批量新增文章标签关联
     * 
     * @param articleTags 文章标签关联列表
     * @return 结果
     */
    public int batchInsertBlogArticleTag(List<BlogArticleTag> articleTags);

    /**
     * 删除文章标签关联
     * 
     * @param articleId 文章ID
     * @return 结果
     */
    public int deleteBlogArticleTagByArticleId(Long articleId);

    /**
     * 根据文章ID查询标签ID列表
     * 
     * @param articleId 文章ID
     * @return 标签ID列表
     */
    public Long[] selectTagIdsByArticleId(Long articleId);
}
