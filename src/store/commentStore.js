import { defineStore } from 'pinia';

export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [
      { id: 1, content: '这是一条示例留言！', likes: 3, approved: true },
      { id: 2, content: '下一场比赛什么时候开始？', likes: 1, approved: false }
    ],
    nextId: 3
  }),
  actions: {
    addComment(content, isAdmin = false) {
      const newComment = {
        id: this.nextId++,
        content,
        likes: 0,
        approved: isAdmin ? true : false
      };
      this.comments.push(newComment);
    },
    likeComment(id) {
      const comment = this.comments.find(c => c.id === id);
      if (comment) {
        comment.likes++;
      }
    },
    deleteComment(id) {
      this.comments = this.comments.filter(c => c.id !== id);
    },
    approveComment(id) {
      const comment = this.comments.find(c => c.id === id);
      if (comment) {
        comment.approved = true;
      }
    }
  }
});
