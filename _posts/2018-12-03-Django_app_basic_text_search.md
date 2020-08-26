---
layout: post
title: Django App Basic Text Search
date: 2018-12-03
tags: ['Python', 'Django', 'PostgreSQL', 'text search']
---

Checking the dependencies on my Django demo app from time to time to time on Heroku, I noticed a few packages were out of date. So while I got to updating all packages to the most recent stable versions, I found the app to be lacking a popular option for searching basic text records. Thus I began looking into my options of what searches to implement. There were high end packages like Elastisearch, but ultimately I wanted this feature and my code base to remain portable, so I decided to remain with native Python and Django implementations. After some investigation, I found in the official documentation that Django has built-in support for full text search as of v2.1, with the only requirement being that the project uses PostgreSQL.

My Django demo app repository can be found [here](https://github.com/sbhaseen/django_web_app_demo).

Some good references that help implementing this basic text search:

- [Django - Full text search](https://docs.djangoproject.com/en/2.1/ref/contrib/postgres/search/)
- [Django - Making queries](https://docs.djangoproject.com/en/2.1/topics/db/queries/)
- [PostgreSQL - Full text search](https://www.postgresql.org/docs/current/textsearch.html)

Some additional setup was required as my initial project was using SQLite to test locally, even though my Heroku deployment is on PostgreSQL. So I quickly setup a Postgres development environment and transferred my project over to Postgres local development as well. I also learned a bit about transferring databases using CSV files, but that's probably for another post.

---

## Adding Search Queries

### Views.py

The first thing to do was to setup a class based view that inherits the properties of the base Book model in the app's views.py.

Over here, a special template named "book_search.html" is overriding the base "book_list.html" to differentiate results to users. Although in theory, the basic "book_list.html" can be used if it is made generic enough, it probably would not scale well if the website had things other than books to display.

To run though the logic quickly, this is what happens:

1. A Book-object query with all results is initialized.
2. A `keyword` variable is initialized based on a search query input from the navbar.
3. If a search query (keyword) is detected, the special Django built-in function `SearchQuery()` if applied to the `keyword` input.
4. A `SearchVector()` function is applied to the fields of the Book model that are desired to be searched. In this case I limited it to the use of Author name, title, summary and genre.
5. The `SearchVector()` is then applied with a filter containing the `query` of keywords.
6. The built in `SearchRank()` function is used to try and list the most relevant results first.

The code looks as follows:

```python
...
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector


class BookSearchListView(generic.ListView):
    """
    Display a Book List page filtered by the search query.
    """
    model = Book
    paginate_by = 10
    template_name = 'catalog/book_search.html'

    def get_queryset(self):
        qs = Book.objects.all()

        keywords = self.request.GET.get('q')
        if keywords:
            query = SearchQuery(keywords)
            # ManyToMany or ForeignKey fields need (double underscore) lookup type to work: in this case __name
            vector = SearchVector('author__first_name',
                                  'author__last_name',
                                  'title',
                                  'summary',
                                  'genre__name')
            qs = qs.annotate(search=vector).filter(search=query)
            qs = qs.annotate(rank=SearchRank(vector, query)).order_by('-rank')

        return qs

```

### Urls.py

After adding the new search view, the urls.py has to be configured to setup the search results. This was pretty straight forward and only needed one addition to the existing `urlpatterns` list.

```python
urlpatterns = [
    ...
    path('search/', views.BookSearchListView.as_view(), name='search'),
]
```

### The search results template: book_search.html

After configuring the urls.py, it was time to make the template for the search results. As mentioned earlier, I could reuse the base model template, but wanted to separate the results in case I decide to expand general search functionality in the future.

This template is actually exactly the same as the "book_list.html", except the header is set to "Book Search Results" and the failure statement returns "The search did not find any results".

One important modification was to show the search query that a user input, which can be done easily with the `request.GET` method.

```html
...
<p>The results of the search query: {% raw %}{{ request.GET.q }}{% endraw %}</p>
...
```

### Adding a test for the new search view: test_views.py

Test driven development is something I like to work within as it keeps up good coding practice and documentation. In this case, I added tests that will ensure proper search functionality.

The test will setup some dummy book instances and then test the following:

- The url is properly redirected
- The correct template is used for search results
- The individual fields of the Book model are properly queried: Author, title, summary and genre. It also test that no results are retunred in case of an out-of-scope search query.

```python
...
# Test basic text search functionality
class SearchBooksListViewTest(TestCase):
    def setUp(self):
        test_author = Author.objects.create(first_name='John', last_name='Smith')
        test_genre = Genre.objects.create(name='Science Fiction')
        test_language = Language.objects.create(name='English')
        test_book = Book.objects.create(
            title='Book Title',
            summary='My book summary has interesting stories of machines and robots',
            isbn='1234567890123',
            author=test_author,
            language=test_language,
        )

        # Create genre as a post-step
        genre_objects_for_book = Genre.objects.all()
        test_book.genre.set(genre_objects_for_book) # Direct assignment of many-to-many types not allowed.
        test_book.save()

        # Create 30 BookInstance objects
        number_of_book_copies = 30
        for book_copy in range(number_of_book_copies):
            status = 'a'
            BookInstance.objects.create(
                book=test_book,
                imprint='Unlikely Imprint, 2016',
                status=status,
            )

    def test_uses_correct_template(self):
        # Check that urls.py is configured correctly
        response = self.client.get(reverse('search'))

        # Check response was a "success"
        self.assertEqual(response.status_code, 200)

        # Check correct template used
        self.assertTemplateUsed(response, 'catalog/book_search.html')

    def test_search_function_redirect_and_query(self):
        """
        The search class based view `BookSearchListView` in views.py queries
        these SearchVectors from the Book model: author, title, summary, genre
        """
        # Check author returns a book
        resp = self.client.get('/catalog/search/', {'q': 'john smith'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.context['book_list']) > 0)

        # Check title returns a book
        resp = self.client.get('/catalog/search/', {'q': 'book title'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.context['book_list']) > 0)

        # Check summary returns a book
        resp = self.client.get('/catalog/search/', {'q': 'machine'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.context['book_list']) > 0)

        # Check genre returns a book
        resp = self.client.get('/catalog/search/', {'q': 'fiction'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.context['book_list']) > 0)

        # Check out of scope search does not return any book
        resp = self.client.get('/catalog/search/', {'q': 'drama'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.context['book_list']) == 0)

```

And with that, the site now has basic text search!

Update: This project was formely hosted on Heroku, but is now archieved for reference code only.

A screenshot for fun:
[![png](/images/django_app_search_01.png)](/images/django_app_search_01.png)
