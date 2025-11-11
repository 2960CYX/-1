package com.ruoyi.blog.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.blog.mapper.BlogCommentMapper;
import com.ruoyi.blog.domain.BlogComment;
import com.ruoyi.blog.service.IBlogCommentService;

import com.ruoyi.common.constant.CacheConstants;
import com.ruoyi.common.core.domain.model.LoginUser;
import com.ruoyi.common.core.redis.RedisCache;
import com.ruoyi.common.exception.user.CaptchaException;
import com.ruoyi.common.exception.user.CaptchaExpireException;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.service.ISysConfigService;
import com.ruoyi.common.exception.ServiceException;

/**
 * 博客评论Service业务层处理
 * 
 * @author CYX
 * @date 2025-10-31
 */
@Service
public class BlogCommentServiceImpl implements IBlogCommentService 
{
    @Autowired
    private BlogCommentMapper blogCommentMapper;

    @Autowired
    private RedisCache redisCache;

    @Autowired
    private ISysConfigService configService;

    // 已按你的要求移除后端清洗逻辑，仅保留长度校验与验证码

    /**
     * 评论纯文本最大长度
     */
    private static final int COMMENT_TEXT_MAX_LEN = 1000;

    /**
     * 查询博客评论
     * 
     * @param commentId 博客评论主键
     * @return 博客评论
     */
    @Override
    public BlogComment selectBlogCommentByCommentId(Long commentId)
    {
        return blogCommentMapper.selectBlogCommentByCommentId(commentId);
    }

    /**
     * 查询博客评论列表
     * 
     * @param blogComment 博客评论
     * @return 博客评论
     */
    @Override
    public List<BlogComment> selectBlogCommentList(BlogComment blogComment)
    {
        return blogCommentMapper.selectBlogCommentList(blogComment);
    }

    /**
     * 新增博客评论
     * 
     * @param blogComment 博客评论
     * @return 结果
     */
    @Override
    public int insertBlogComment(BlogComment blogComment)
    {
        blogComment.setDelFlag("0");
        blogComment.setCreateTime(DateUtils.getNowDate());

        LoginUser loginUser = null;
        try
        {
            loginUser = SecurityUtils.getLoginUser();
        }
        catch (Exception ignored)
        {
        }

        if (loginUser != null)
        {
            blogComment.setUserId(loginUser.getUserId());
            blogComment.setNickname(StringUtils.defaultIfBlank(loginUser.getUser().getNickName(), loginUser.getUsername()));
            blogComment.setStatus("1");
        }
        else
        {
            if (configService.selectCaptchaEnabled())
            {
                validateCaptcha(blogComment.getUuid(), blogComment.getCode());
            }
            blogComment.setStatus("0");
            blogComment.setUserId(null);
        }

        blogComment.setCode(null);
        blogComment.setUuid(null);
        // 仅进行长度校验，不做后端 HTML 清洗
        String content = StringUtils.nvl(blogComment.getContent(), "").trim();
        String textOnly = content;
        if (textOnly.length() > COMMENT_TEXT_MAX_LEN) {
            throw new ServiceException("评论内容过长，最多" + COMMENT_TEXT_MAX_LEN + "字");
        }
        blogComment.setContent(content);
        return blogCommentMapper.insertBlogComment(blogComment);
    }

    /**
     * 修改博客评论
     * 
     * @param blogComment 博客评论
     * @return 结果
     */

    private void validateCaptcha(String uuid, String code)
    {
        if (StringUtils.isAnyBlank(uuid, code))
        {
            throw new CaptchaException();
        }
        String verifyKey = CacheConstants.CAPTCHA_CODE_KEY + StringUtils.nvl(uuid, "");
        String captcha = redisCache.getCacheObject(verifyKey);
        redisCache.deleteObject(verifyKey);
        if (captcha == null)
        {
            throw new CaptchaExpireException();
        }
        if (!code.equalsIgnoreCase(captcha))
        {
            throw new CaptchaException();
        }
    }

    @Override
    public int updateBlogComment(BlogComment blogComment)
    {
        blogComment.setUpdateTime(DateUtils.getNowDate());
        // 更新时同样仅进行长度校验
        String content = StringUtils.nvl(blogComment.getContent(), "").trim();
        String textOnly = content;
        if (textOnly.length() > COMMENT_TEXT_MAX_LEN) {
            throw new ServiceException("评论内容过长，最多" + COMMENT_TEXT_MAX_LEN + "字");
        }
        blogComment.setContent(content);
        return blogCommentMapper.updateBlogComment(blogComment);
    }

    /**
     * 批量删除博客评论
     * 
     * @param commentIds 需要删除的博客评论主键
     * @return 结果
     */
    @Override
    public int deleteBlogCommentByCommentIds(Long[] commentIds)
    {
        return blogCommentMapper.deleteBlogCommentByCommentIds(commentIds);
    }

    /**
     * 删除博客评论信息
     * 
     * @param commentId 博客评论主键
     * @return 结果
     */
    @Override
    public int deleteBlogCommentByCommentId(Long commentId)
    {
        return blogCommentMapper.deleteBlogCommentByCommentId(commentId);
    }
}
