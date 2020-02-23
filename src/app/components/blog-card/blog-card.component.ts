import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Post } from 'src/app/models/post';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SnackbarService } from '../../services/snackbar.service';
import { AppUser } from '../../models/appuser';
import { AuthService } from '../../services/auth.service';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-blog-card',
  templateUrl: './blog-card.component.html',
  styleUrls: ['./blog-card.component.scss']
})
export class BlogCardComponent implements OnInit, OnDestroy {

  blogPost: Post[] = [];
  private unsubscribe$ = new Subject<void>();
  config: any;
  pageSizeOptions = [];
  appUser: AppUser;

  constructor(private blogService: BlogService,
    private snackBarService: SnackbarService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private commentService: CommentService) {
    this.authService.appUser$.subscribe(appUser => this.appUser = appUser);
    this.pageSizeOptions = [2, 4, 6];
    const pageSize = localStorage.getItem('pageSize');
    this.config = {
      currentPage: 1,
      itemsPerPage: pageSize ? +pageSize : this.pageSizeOptions[0]
    };

  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.config.currentPage = +params['pagenum'];
        this.getBlogPosts();
      }
    );

  }

  getBlogPosts() {
    this.blogService.getAllPosts()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        this.blogPost = result;
      });
  }

  delete(postId) {
    if (confirm('Are you sure')) {
      this.blogService.deletePost(postId).then(
        () => {
          this.commentService.deleteAllCommentForBlog(postId);
          this.snackBarService.showSnackBar('Blog post deleted successfully');
        }
      );
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
