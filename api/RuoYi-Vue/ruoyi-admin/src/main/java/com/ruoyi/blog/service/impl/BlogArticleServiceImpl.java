package com.ruoyi.blog.service.impl;

import java.util.List;
import java.util.ArrayList;
import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.common.utils.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ruoyi.blog.mapper.BlogArticleMapper;
import com.ruoyi.blog.domain.BlogArticle;
import com.ruoyi.blog.domain.BlogArticleTag;
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
        BlogArticle blogArticle = blogArticleMapper.selectBlogArticleByArticleId(articleId);
        if (blogArticle != null)
        {
            // 查询文章关联的标签ID列表
            Long[] tagIds = blogArticleMapper.selectTagIdsByArticleId(articleId);
            blogArticle.setTagIds(tagIds);
        }
        return blogArticle;
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
    @Transactional
    public int insertBlogArticle(BlogArticle blogArticle)
    {
        blogArticle.setCreateTime(DateUtils.getNowDate());
        int result = blogArticleMapper.insertBlogArticle(blogArticle);
        
        // 保存文章标签关联
        insertBlogArticleTag(blogArticle);
        
        return result;
    }

    /**
     * 修改博客文章
     * 
     * @param blogArticle 博客文章
     * @return 结果
     */
    @Override
    @Transactional
    public int updateBlogArticle(BlogArticle blogArticle)
    {
        blogArticle.setUpdateTime(DateUtils.getNowDate());
        
        // 删除原有的文章标签关联
        blogArticleMapper.deleteBlogArticleTagByArticleId(blogArticle.getArticleId());
        
        // 保存新的文章标签关联
        insertBlogArticleTag(blogArticle);
        
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
    @Transactional
    public int deleteBlogArticleByArticleId(Long articleId)
    {
        // 删除文章标签关联
        blogArticleMapper.deleteBlogArticleTagByArticleId(articleId);
        
        return blogArticleMapper.deleteBlogArticleByArticleId(articleId);
    }

    /**
     * 新增文章标签信息
     * 
     * @param blogArticle 博客文章对象
     */
    public void insertBlogArticleTag(BlogArticle blogArticle)
    {
        Long[] tagIds = blogArticle.getTagIds();
        if (StringUtils.isNotNull(tagIds))
        {
            List<BlogArticleTag> list = new ArrayList<BlogArticleTag>();
            for (Long tagId : tagIds)
            {
                BlogArticleTag bat = new BlogArticleTag();
                bat.setArticleId(blogArticle.getArticleId());
                bat.setTagId(tagId);
                list.add(bat);
            }
            if (list.size() > 0)
            {
                blogArticleMapper.batchInsertBlogArticleTag(list);
            }
        }
    }
}
