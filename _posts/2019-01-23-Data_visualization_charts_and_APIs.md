---
layout: post
title: Data visualization, charts and API's
date: 2019-01-23
tags: ['Python', 'Django', 'Charts', 'data visualization', 'Charts.js', 'API']
---

I felt my Django demo site needed a bit more flare to it, so I decided to add a nice little chart to visualize some of the data about book copy availability. At first, it seemed like I simply need to add a charting library such as `Chart.js` but I soon learned that it needed a bit more than that. A bridge was required so that I could pass my Python logic which queries the database into something that can be interpreted by JavaScript to render those queries. This bridge would also require asynchronous calls using jQuery AJAX.

My Django demo app repository can be found [here](https://github.com/sbhaseen/django_web_app_demo).

Some good references that helped me to implement this chart feature:

- [Chart.js - Documentation](https://www.chartjs.org/docs/latest/)
- [jQuery - AJAX Documentation](http://api.jquery.com/jquery.ajax/)
- [Django - JsonResponse Objects](https://docs.djangoproject.com/en/2.1/ref/request-response/)

---

## Choosing the right visualization library: Chart.js

There are many good charting libraries to select from these days. My choice of [Chart.js](https://www.chartjs.org/) was based on the following criteria:

1. Easy to integrate, without many dependencies -> All I needed was to add the `.js` script file or CDN link to my project
2. Simple to use for displaying a very small data sets -> I only needed a small graphic to show 3 data points
3. Look nice and have some built-in animations

A close runner up was [plotly](https://plot.ly/plotly-js-scientific-d3-charting-library/) and then [Dash](https://dash.plot.ly/). However these two libraries are focused on data analytics/science and would be way overkill for the simple needs of my demo site. However, I was intrigued by the capabilities Dash and might explore building a complete Dash app at some point in the future.

## Implementing a lightweight API

After experimenting with various function calls, it became clear that I needed data processed in the background via Python and then sent in a readable form to JavaScript.

As a disclaimer, in the real-world I would probably use something more substantial with built-in security features such as the [Django REST Framework](https://www.django-rest-framework.org/). However that's much more than I need for the simple purpose of my demo site, so instead I decided to make a lightweight pseudo API system using a Django view function.

In order to make my own lightweight API system, I used a Python function in the Django app view to query the database and send those results to a JSON endpoint that is read via an AJAX JavaScript function call.

Specifically, what I needed from Python and the database was the availability of all the copies of the books in the library. Previously, a "status" attribute was added to the book instance model which allowed an administrator/librarian to specify if a copy was 'Available', in 'Maintenance' or 'On Loan'. This attribute can now be used to create a query set to count the number of book copies with each status.

In the app's `views.py` file this function view was added:

```python
from django.http import JsonResponse

def get_data(request, *args, **kwargs):
    """
    Get data for charts.
    """
    # Available copies of books
    qs_available = BookInstance.objects.filter(status__exact='a').count()
    # Books in maintenance
    qs_maintenance = BookInstance.objects.filter(status__exact='m').count()
    # Books on loan
    qs_loaned = BookInstance.objects.filter(status__exact='o').count()

    labels = ["Available", "Maintenance", "Loaned"]
    data_items = [qs_available, qs_maintenance, qs_loaned]

    data = {"labels": labels,
            "data": data_items
    }
    return JsonResponse(data)
```

Subsequently, the app's `urls.py` file needed this new endpoint added in:

```python
...
from .views import get_data

urlpatterns = [
    ...
    path('api/data/', get_data, name='api-data'),
]
...
```

## Building the AJAX bridge and rendering the chart

Now that data would be available via an API, it is more easily accessed by JavaScript. To this end, I created a new JavaScript file that would be responsible for handling the chart rendering.

This script file start off with some variables to assign the required data. Note that the endpoint in this case uses the Django app name `/catalog/` prior to the `api/data/` because it is defined inside the `catalog` app.

```javascript
// Chart Definition and JS Render Calls

var endpoint = '/catalog/api/data/';
var chartLabels = [];
var chartData = [];

var chartColor = ['rgba( 63, 191,  63, 0.6)',
                  'rgba(225,  45,  45, 0.6)',
                  'rgba( 45,  45, 225, 0.6)'];
...
```

Then the AJAX function is defined, where it reads the endpoint information on success or outputs an error in the console log if it fails.

```javascript
...
$.ajax({
    url: endpoint,
    success: function(data) {
      chartLabels = data.labels;
      chartData = data.data;
      setChart();
    },
    error: function(error_data) {
      console.log("error");
      console.log(error_data);
    }
});
...
```

Finally the rendering function of the chart is defined using the Chart.js library built-in elements. This is an extrapolation of the basic [Doughnut and Pie chart example](https://www.chartjs.org/docs/latest/charts/doughnut.html) from the Chart.js documentation. The chart object is called `statusPieChart`, which is used later to reference it in the HTML template.

```javascript
...
function setChart() {
  var ctx = document.getElementById("statusPieChart");
  var myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
          datasets: [{
              data: chartData,
              backgroundColor: chartColor,
              borderColor: chartColor,
              borderWidth: 1
          }],
          labels: chartLabels
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: 'Book Copy Status'
        },
        legend: {
          display: true
        },
      }
  });
}

```

## Displaying the actual chart

Now that the heavy lifting/processing is done, the actual chart needs to be added in the HTML template. The location with most impact for this chart was the home/index page as there already was a some numerical library data present.

Since I am extending existing functionality via Javascript, I first added a special block tag to my `base_generic.html` file that would ensure any additional JavaScript is added in proper execution sequence. This tag is called `block javascript` and is placed after the existing JavaScript files.

In the `base_generic.html` file, I added this:

```html
...
<!-- Javascript -->
... {% raw %} {% block javascript %}{% endblock %} {% endraw %} ...
```

Next, to update my `index.html` page, I added the chart JavaScript files. Note the use of the `load staticfiles` tag to ensure that new static files will render that are not part of the `base_generic` template. Omitting this will throw a Djagno error.

```html
... {% raw %} {% load staticfiles %} {% block javascript %}
<script src="{% static 'js/Chart.bundle.min.js' %}"></script>
<script src="{% static 'js/chartrenders.js' %}"></script>
{% endblock %} {% endraw %} ...
```

Further into the index page, I added the actual call to the chart object `statusPieChart`. I also specified a relative position and relative size for the container in order to facilitate the responsive nature of Chart.js objects that automatically scales with screen size. This was learned from the Chart.js documentation about [responsive behavior](https://www.chartjs.org/docs/latest/general/responsive.html).

```html
...
<div class="col-sm-6" style="position: relative; height:40vh; width:80vw">
  <canvas id="statusPieChart"></canvas>
</div>
...
```

With those updates in place, the home page now shows a chart like in the screenshot below.

Update: This project was formely hosted on Heroku, but is now archieved for reference code only.

A screenshot of the improved home page:
[![png](/images/Django_chartjs_01.png)](/images/Django_chartjs_01.png)
