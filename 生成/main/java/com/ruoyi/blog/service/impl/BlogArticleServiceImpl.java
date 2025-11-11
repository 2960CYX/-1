package com.ruoyi.blog.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.blog.mapper.BlogArticleMapper;
import com.ruoyi.blog.domain.BlogArticle;
import com.ruoyi.blog.service.IBlogArticleService;

/**
 * 博客文章Service业务层处理
 * 
 * @author CYX
 * @date 2025-10-31
 */
@Service
public class BlogArticleServiceImpl implements IBlogArticleService 
{
    @Autowired
    private BlogArticleMapper blogArticleMapper;

    /**
     * 查询博客文章
     * 
     * @param articleId 博客文章主键
     * @return 博客文章
     */
    @Override
    public BlogArticle selectBlogArticleByArticleId(Long articleId)
    {
        return blogArticleMapper.selectBlogArticleByArticleId(articleId);
    }

    /**
     * 查询博客文章列表
     * 
     * @param blogArticle 博客文章
     * @return 博客文章
     */
    @Override
    public List<BlogArticle> selectBlogArticleList(BlogArticle blogArticle)
    {
        return blogArticleMapper.selectBlogArticleList(blogArticle);
    }

    /**
     * 新增博客文章
     * 
     * @param blogArticle 博客文章
     * @return 结果
     */
    @Override
    public int insertBlogArticle(BlogArticle blogArticle)
    {
        blogArticle.setCreateTime(DateUtils.getNowDate());
        return blogArticleMapper.insertBlogArticle(blogArticle);
    }

    /**
     * 修改博客文章
     * 
     * @param blogArticle 博客文章
     * @return 结果
     */
    @Override
    public int updateBlogArticle(BlogArticle blogArticle)
    {
        blogArticle.setUpdateTime(DateUtils.getNowDate());
        return blogArticleMapper.updateBlogArticle(blogArticle);
    }

    /**
     * 批量删除博客文章
     * 
     * @param articleIds 需要删除的博客文章主键
     * @return 结果
     */
    @Override
    public int deleteBlogArticleByArticleIds(Long[] articleIds)
    {
        return blogArticleMapper.deleteBlogArticleByArticleIds(articleIds);
    }

    /**
     * 删除博客文章信息
     * 
     * @param articleId 博客文章主键
     * @return 结果
     */
    @Override
    public int deleteBlogArticleByArticleId(Long articleId)
    {
        return blogArticleMapper.deleteBlogArticleByArticleId(articleId);
    }
}
