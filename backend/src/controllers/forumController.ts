import type { Request, Response, NextFunction } from "express";
import { forumService } from "../services/forumService";

function ctxFrom(req: Request) {
  return {
    actorUserId: req.user!.id,
    actorRole: req.user!.role,
    requestId: req.requestId,
    ipAddress: req.ip,
  };
}

export const forumController = {
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await forumService.posts.create(req.body, ctxFrom(req));
      res.status(201).json({ message: "Post created.", data });
    } catch (err) {
      next(err);
    }
  },

  async listPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await forumService.posts.list(
        req.query as unknown as Parameters<typeof forumService.posts.list>[0],
        ctxFrom(req),
      );
      res.status(200).json({ data, meta });
    } catch (err) {
      next(err);
    }
  },

  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params as { postId: string };
      const data = await forumService.posts.getById(postId, ctxFrom(req));
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params as { postId: string };
      const data = await forumService.posts.update(
        postId,
        req.body,
        ctxFrom(req),
      );
      res.status(200).json({ message: "Post updated.", data });
    } catch (err) {
      next(err);
    }
  },

  async setPostSolved(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params as { postId: string };
      const { solved } = req.body as { solved: boolean };
      const data = await forumService.posts.setSolved(postId, solved, ctxFrom(req));
      res.status(200).json({ message: solved ? "Marked solved." : "Marked unsolved.", data });
    } catch (err) {
      next(err);
    }
  },

  async removePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params as { postId: string };
      await forumService.posts.remove(postId, ctxFrom(req));
      res.status(200).json({ message: "Post deleted." });
    } catch (err) {
      next(err);
    }
  },

  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params as { postId: string };
      const { body } = req.body as { body: string };
      const data = await forumService.comments.create(
        postId,
        body,
        ctxFrom(req),
      );
      res.status(201).json({ message: "Comment added.", data });
    } catch (err) {
      next(err);
    }
  },

  async listComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params as { postId: string };
      const data = await forumService.comments.listByPost(postId, ctxFrom(req));
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params as { commentId: string };
      const { body } = req.body as { body: string };
      const data = await forumService.comments.update(
        commentId,
        body,
        ctxFrom(req),
      );
      res.status(200).json({ message: "Comment updated.", data });
    } catch (err) {
      next(err);
    }
  },

  async removeComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params as { commentId: string };
      await forumService.comments.remove(commentId, ctxFrom(req));
      res.status(200).json({ message: "Comment deleted." });
    } catch (err) {
      next(err);
    }
  },

  async castVote(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId, value } = req.body as {
        targetType: "forum_post" | "forum_comment";
        targetId: string;
        value: 1 | -1;
      };
      const data = await forumService.votes.cast(
        targetType,
        targetId,
        value,
        ctxFrom(req),
      );
      res.status(200).json({ message: "Vote recorded.", data });
    } catch (err) {
      next(err);
    }
  },

  async removeVote(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId } = req.body as {
        targetType: "forum_post" | "forum_comment";
        targetId: string;
      };
      await forumService.votes.remove(targetType, targetId, ctxFrom(req));
      res.status(200).json({ message: "Vote removed." });
    } catch (err) {
      next(err);
    }
  },
};
