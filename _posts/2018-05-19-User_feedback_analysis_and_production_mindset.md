---
layout: post
title: User feedback analysis and production mindset
date: 2018-05-19
tags: ['Python', 'statistics', 'data analysis']
---

Data: A data set based on real operations  
Methods: Data retrieval, data cleaning & manipulation, exploratory data analysis, functional programming

---

## A brief summary

The motivation behind this project is to demonstrate what I had to do for a real-world analysis and how it was to develop with a production mindset. At a high level, this is mostly prototyping with some final observations that can lead to a production pipelines. I will also attempt to highlight the business cases for each part of the analysis, because at the end of the day data science and analytics exists to find insights that drive business decisions.

The Jupyter notebook can be found [here](https://github.com/sbhaseen/Python/blob/master/Notebook_User_feedback_analysis_and_production_mindset/User_feedback_analysis_and_production_mindset.ipynb).

An old acquaintance approached me regarding my foray into data science and analytics. After some discussion, I was requested to assist with some historical data analysis and thus requested if I could showcase a portion of this work. It was agreed upon that I may use some of the work, so long as any specifics would be left out.

**To clarify: while the data is based on real operations, is not from production, for obvious privacy and security reasons. It is a toy data set I put together that closely emulates the real world scenarios that were encountered.**

For some context, the business deals with content delivery apps that rate interactions with various service providers.

## 1. - Transactional data and user interactions

In the first section, we look at some orders that pass through the backend and explore the various interactions of users and business partners. From a business perspective, this is useful in determining information such as peak times and other events that lead to increased demand, high value clients and potential allocation of business resources.

Let's start with the usual imports for data manipulation, then proceed to read in the data and examine the head and tail.

```python
import pandas as pd
import numpy as np
```

```python
df1 = pd.read_csv('datasets/dataset1.csv')
df1.head()
```

<div class="table-wrapper" markdown="block">
<table>
  <thead>
    <tr >
      <th></th>
      <th>Date</th>
      <th>Time</th>
      <th>User</th>
      <th>Partner</th>
      <th>Status</th>
      <th>Transaction ($)</th>
      <th>Category</th>
      <th>Sequence Time (min:sec)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>8/30/2015</td>
      <td>7:22 PM</td>
      <td>192749</td>
      <td>RTAEBO</td>
      <td>ACCEPTED</td>
      <td>11.30</td>
      <td>E</td>
      <td>0:14</td>
    </tr>
    <tr>
      <th>1</th>
      <td>8/30/2015</td>
      <td>7:47 PM</td>
      <td>697640</td>
      <td>G43YQ1</td>
      <td>REJECTED</td>
      <td>8.60</td>
      <td>C</td>
      <td>10:18</td>
    </tr>
    <tr>
      <th>2</th>
      <td>8/30/2015</td>
      <td>7:13 PM</td>
      <td>192749</td>
      <td>5I5LAT</td>
      <td>REJECTED</td>
      <td>4.19</td>
      <td>E</td>
      <td>0:36</td>
    </tr>
    <tr>
      <th>3</th>
      <td>8/30/2015</td>
      <td>7:11 PM</td>
      <td>192749</td>
      <td>5I5LAT</td>
      <td>REJECTED</td>
      <td>4.19</td>
      <td>E</td>
      <td>0:23</td>
    </tr>
    <tr>
      <th>4</th>
      <td>8/30/2015</td>
      <td>7:16 PM</td>
      <td>192749</td>
      <td>5I5LAT</td>
      <td>REJECTED</td>
      <td>4.19</td>
      <td>E</td>
      <td>0:17</td>
    </tr>
  </tbody>
</table>
</div>

```python
df1.tail()
```

<div class="table-wrapper" markdown="block">
<table>
  <thead>
    <tr >
      <th></th>
      <th>Date</th>
      <th>Time</th>
      <th>User</th>
      <th>Partner</th>
      <th>Status</th>
      <th>Transaction ($)</th>
      <th>Category</th>
      <th>Sequence Time (min:sec)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>3834</th>
      <td>9/3/2015</td>
      <td>8:32 AM</td>
      <td>172171</td>
      <td>4E0GZ9</td>
      <td>ACCEPTED</td>
      <td>1.94</td>
      <td>C</td>
      <td>1:04</td>
    </tr>
    <tr>
      <th>3835</th>
      <td>9/3/2015</td>
      <td>7:40 AM</td>
      <td>987192</td>
      <td>4E0GZ9</td>
      <td>CANCELLED</td>
      <td>1.94</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>3836</th>
      <td>9/3/2015</td>
      <td>7:32 AM</td>
      <td>844451</td>
      <td>KOZM4L</td>
      <td>ACCEPTED</td>
      <td>1.58</td>
      <td>C</td>
      <td>0:25</td>
    </tr>
    <tr>
      <th>3837</th>
      <td>9/3/2015</td>
      <td>8:10 AM</td>
      <td>801690</td>
      <td>UK1GEQ</td>
      <td>ACCEPTED</td>
      <td>1.47</td>
      <td>C</td>
      <td>1:18</td>
    </tr>
    <tr>
      <th>3838</th>
      <td>9/3/2015</td>
      <td>9:14 AM</td>
      <td>619584</td>
      <td>UK1GEQ</td>
      <td>ACCEPTED</td>
      <td>1.47</td>
      <td>C</td>
      <td>0:18</td>
    </tr>
  </tbody>
</table>
</div>

```python
df1.info()
```

    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 3839 entries, 0 to 3838
    Data columns (total 8 columns):
    Date                       3839 non-null object
    Time                       3839 non-null object
    User                       3839 non-null int64
    Partner                    3839 non-null object
    Status                     3839 non-null object
    Transaction ($)            3839 non-null float64
    Category                   3839 non-null object
    Sequence Time (min:sec)    3822 non-null object
    dtypes: float64(1), int64(1), object(6)
    memory usage: 240.0+ KB

Observing that there are some null values, it is a good idea to explore where they occur and attempt to determine why.

```python
df1[df1.isnull().any(axis=1)]
```

<div class="table-wrapper" markdown="block">
<table>
  <thead>
    <tr>
      <th></th>
      <th>Date</th>
      <th>Time</th>
      <th>User</th>
      <th>Partner</th>
      <th>Status</th>
      <th>Transaction ($)</th>
      <th>Category</th>
      <th>Sequence Time (min:sec)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>270</th>
      <td>8/31/2015</td>
      <td>7:02 AM</td>
      <td>376269</td>
      <td>1HFZX3</td>
      <td>CANCELLED</td>
      <td>12.43</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>317</th>
      <td>8/31/2015</td>
      <td>11:54 AM</td>
      <td>802368</td>
      <td>66CCIF</td>
      <td>CANCELLED</td>
      <td>11.79</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>406</th>
      <td>8/31/2015</td>
      <td>11:36 AM</td>
      <td>375782</td>
      <td>KIAD9J</td>
      <td>CANCELLED</td>
      <td>10.51</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>724</th>
      <td>8/31/2015</td>
      <td>11:44 AM</td>
      <td>656236</td>
      <td>TENC59</td>
      <td>CANCELLED</td>
      <td>6.22</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>887</th>
      <td>8/31/2015</td>
      <td>10:45 PM</td>
      <td>852434</td>
      <td>O6S3BJ</td>
      <td>CANCELLED</td>
      <td>2.63</td>
      <td>B</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1445</th>
      <td>9/1/2015</td>
      <td>6:25 PM</td>
      <td>728136</td>
      <td>KUMYVP</td>
      <td>CANCELLED</td>
      <td>10.11</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1559</th>
      <td>9/1/2015</td>
      <td>2:22 PM</td>
      <td>307389</td>
      <td>KQ143B</td>
      <td>CANCELLED</td>
      <td>8.48</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1652</th>
      <td>9/1/2015</td>
      <td>12:11 PM</td>
      <td>703945</td>
      <td>CICECE</td>
      <td>CANCELLED</td>
      <td>6.46</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1681</th>
      <td>9/1/2015</td>
      <td>9:04 AM</td>
      <td>116929</td>
      <td>59GUWG</td>
      <td>CANCELLED</td>
      <td>5.38</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1789</th>
      <td>9/1/2015</td>
      <td>1:09 PM</td>
      <td>237407</td>
      <td>CICECE</td>
      <td>CANCELLED</td>
      <td>3.26</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>1824</th>
      <td>9/1/2015</td>
      <td>12:10 PM</td>
      <td>703945</td>
      <td>7V03NL</td>
      <td>CANCELLED</td>
      <td>2.75</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>9/2/2015</td>
      <td>11:16 AM</td>
      <td>660854</td>
      <td>66CCIF</td>
      <td>CANCELLED</td>
      <td>14.67</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>2358</th>
      <td>9/2/2015</td>
      <td>11:46 AM</td>
      <td>938800</td>
      <td>D68YJF</td>
      <td>CANCELLED</td>
      <td>10.11</td>
      <td>A</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>3032</th>
      <td>9/3/2015</td>
      <td>10:53 AM</td>
      <td>740361</td>
      <td>FNG052</td>
      <td>CANCELLED</td>
      <td>13.61</td>
      <td>D</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>3095</th>
      <td>9/3/2015</td>
      <td>8:09 AM</td>
      <td>747742</td>
      <td>BZLPKD</td>
      <td>CANCELLED</td>
      <td>13.45</td>
      <td>D</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>3662</th>
      <td>9/3/2015</td>
      <td>10:47 AM</td>
      <td>880353</td>
      <td>A1AAHF</td>
      <td>CANCELLED</td>
      <td>6.00</td>
      <td>A</td>
      <td>NaN</td>
    </tr>
    <tr>
      <th>3835</th>
      <td>9/3/2015</td>
      <td>7:40 AM</td>
      <td>987192</td>
      <td>4E0GZ9</td>
      <td>CANCELLED</td>
      <td>1.94</td>
      <td>C</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
</div>

The NaN values in the column "Sequence Time" seem to occur because they correspond with cancelled transactions, so these values will be left as is. From a business standpoint, it might be beneficial to correlate this with other data and understand why a transaction was cancelled, but that was beyond the scope of this analysis.

### 1.1 - Determining how many unique business partners received orders on a particular date

This was fairly straightforward as the data frame takes a single date (Sep. 3, 2015) slice, followed by finding the unique count of the "Partner" column.

```python
df1[df1['Date']=='9/3/2015']['Partner'].nunique()
```

    106

### 1.2 - Finding the highest number of successful transactions on a single day with a given category

To determine this, a conditional slice of Status and Category is used followed by a grouping by date and size aggregation. Applying the max function to all this yields the highest value and which day it occurs on.

```python
df1[(df1['Status'] == 'ACCEPTED') &
    (df1['Category'] == 'C')].groupby('Date').size().reset_index(name='counts').max()
```

    Date      9/3/2015
    counts         737
    dtype: object

### 1.3 - A useful point for marketing strategy: high spending customers

For this, the highest amount of money a user spent during the time period of the dataset was aggregated from all accepted orders.
This approach is similar to the one above, however due the users ID being numerical sequence, `reset_index()` cannot be used to return a pair as above.

(As an aside, if `rest_index()` is used and `max()` is called, it will create a non-index "user" column separately and return two maximum values that do not relate.)

```python
df1[(df1['Status'] == 'ACCEPTED')].groupby('User').sum().max()
```

    Transaction ($)    293.12
    dtype: float64

To solve this is a more readable manner, a new data frame is created which slices the maximum value and return both the user number and associated transaction sum.

(Note: While this is fine for such a relatively small data set such as this, it may not scale well to very large sets in which case more computationally efficient methods should be applied such as the “query” method. See documentation [here](https://pandas.pydata.org/pandas-docs/stable/indexing.html#performance-of-query))

```python
high_value_user = df1[(df1['Status']=='ACCEPTED')].groupby('User').sum()
high_value_user[high_value_user['Transaction ($)'] == high_value_user['Transaction ($)'].max()]
```

<div class="table-wrapper" markdown="block">
<table>
  <thead>
    <tr>
      <th></th>
      <th>Transaction ($)</th>
    </tr>
    <tr>
      <th>User</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>145158</th>
      <td>293.12</td>
    </tr>
  </tbody>
</table>
</div>

### 1.4 - Transaction times and business response

Based on historical trends unique to this business's operations, a response time of under 1 minute is considered ideal, thus to find the times, the data frame can be sliced using categories relating to a particular day and having a response time less than a minute. Here, a particular day (Tuesday, Sep. 1, 2015) was chosen to determine what pecentage of all transactions on that day were faster than a minute.

Recalling from the `df1.info()` method earlier, there were some NaN values in the "Sequence Time" column, thus only non-null values will be considered, which means filtering out transactions that were cancelled.

First, the total number of transactions on that day are calculated.

```python
len(df1[(df1['Date'] == '9/1/2015') & (df1['Status'] != 'CANCELLED')])
```

    935

This is followed by calculating all the transactions less than the ideal response time.

```python
len(df1[(df1['Date'] == '9/1/2015') & (df1['Sequence Time (min:sec)']<'1:00')])
```

    632

However, it can all be determined in a (slightly messy) single line.

```python
len(df1[(df1['Date'] == '9/1/2015') &
        (df1['Sequence Time (min:sec)']<'1:00')]) / len(df1[(df1['Date'] == '9/1/2015') &
                                                            (df1['Status'] != 'CANCELLED')]) * 100
```

    67.59358288770053

## 2. - Service improvement and analysis

The second part of the analysis deals with analyzing user feedback about business partners. This provides both users and partners to determine which operations work well and which can use improvement.

To begin, the second dataset is read in and the head and tail are examined.

```python
df2 = pd.read_csv('datasets/dataset2.csv')
df2.head()
```

<div class="table-wrapper" markdown="block">
<table>
  <thead>
    <tr>
      <th></th>
      <th>Date</th>
      <th>Partner</th>
      <th>Score</th>
      <th>UX</th>
      <th>Transaction Experience</th>
      <th>Process Quality</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>11/20/2015</td>
      <td>UJZDE8</td>
      <td>5</td>
      <td>Good</td>
      <td>Good</td>
      <td>Good</td>
    </tr>
    <tr>
      <th>1</th>
      <td>11/20/2015</td>
      <td>UJZDE8</td>
      <td>5</td>
      <td>Good</td>
      <td>Good</td>
      <td>Good</td>
    </tr>
    <tr>
      <th>2</th>
      <td>11/20/2015</td>
      <td>UJZDE8</td>
      <td>5</td>
      <td>Good</td>
      <td>Good</td>
      <td>Good</td>
    </tr>
    <tr>
      <th>3</th>
      <td>11/20/2015</td>
      <td>UJZDE8</td>
      <td>3</td>
      <td>Improving</td>
      <td>Good</td>
      <td>Good</td>
    </tr>
    <tr>
      <th>4</th>
      <td>11/29/2015</td>
      <td>GXD6NC</td>
      <td>5</td>
      <td>Good</td>
      <td>Good</td>
      <td>Good</td>
    </tr>
  </tbody>
</table>
</div>

```python
df2.tail()
```

<div class="table-wrapper" markdown="block">
<table>
  <thead>
    <tr>
      <th></th>
      <th>Date</th>
      <th>Partner</th>
      <th>Score</th>
      <th>UX</th>
      <th>Transaction Experience</th>
      <th>Process Quality</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>636</th>
      <td>11/17/2015</td>
      <td>XO55ZB</td>
      <td>5</td>
      <td>Good</td>
      <td>Good</td>
      <td>Good</td>
    </tr>
    <tr>
      <th>637</th>
      <td>11/20/2015</td>
      <td>XO55ZB</td>
      <td>5</td>
      <td>Good</td>
      <td>Good</td>
      <td>Good</td>
    </tr>
    <tr>
      <th>638</th>
      <td>11/24/2015</td>
      <td>XO55ZB</td>
      <td>5</td>
      <td>Good</td>
      <td>Good</td>
      <td>Good</td>
    </tr>
    <tr>
      <th>639</th>
      <td>11/26/2015</td>
      <td>XO55ZB</td>
      <td>5</td>
      <td>Improving</td>
      <td>Good</td>
      <td>Good</td>
    </tr>
    <tr>
      <th>640</th>
      <td>11/27/2015</td>
      <td>XO55ZB</td>
      <td>5</td>
      <td>Good</td>
      <td>Good</td>
      <td>Good</td>
    </tr>
  </tbody>
</table>
</div>

```python
df2.info()
```

    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 641 entries, 0 to 640
    Data columns (total 6 columns):
    Date                      641 non-null object
    Partner                   641 non-null object
    Score                     641 non-null int64
    UX                        641 non-null object
    Transaction Experience    641 non-null object
    Process Quality           641 non-null object
    dtypes: int64(1), object(5)
    memory usage: 30.1+ KB

### 2.1 - The average rating for business partners during a given time frame

It is useful to know how business partners score during certain times. This can help improve certain business functions during holiday rushes or other such events.

In this case, the week before Black Friday 2015 is examined (Nov. 16-20) and the average rating is calculated by slicing, grouping and then applying a mean function to the mean aggregation (i.e. mean of the mean).

```python
df2[(df2['Date']>='11/16/2015') & (df2['Date']<='11/20/2015')].groupby('Partner')['Score'].mean().mean()
```

    4.42895168956875

### 2.2 - A case study of levelling up

This was the bulk of the analysis for this particular business. The company has a policy of promoting well performing business partners to a "Gold" rating that has certain benefits and privileges. In order for a business partner to achieve this special status, it must achieve the following criteria:

- Have a minimum of 10 user feedback instances
- Have an average score of at least 4.0
- Have a minimum of "Good" in across all categories for 90% of feedback

To start this analysis, the user feedback is counted and only those partners with more than 10 feedback instances are selected.

```python
df2_count = pd.DataFrame(df2.groupby('Partner')['Date'].count())
df2_feedback_threshold = df2_count[df2_count['Date'] >= 10].index.values.tolist()
df2_feedback_threshold
```

    ['64P2G1',
     '7Q9M2I',
     '886VOM',
     '91DHOD',
     '9EDN58',
     'FJGVQ4',
     'GXBENY',
     'HYM4L1',
     'J08XUI',
     'J4WJ99',
     'KKIBJ3',
     'MEN2KH',
     'OGZ5KO',
     'P1ENTH',
     'P5QA3E',
     'Q7XKWO',
     'RGN5S7',
     'S6PUQ8',
     'TIA4D5',
     'TT7NS2',
     'XO55ZB',
     'ZZG4ZD']

Next, the score threshold is used to filter out partners that do not meet the minimum. The data frame is first sliced for some visual EDA.

```python
df2_score_threshold = df2[df2['Partner'].isin(df2_feedback_threshold)]
df2_score_threshold = pd.DataFrame(df2_score_threshold.groupby('Partner')['Score'].mean())
df2_score_threshold[df2_score_threshold['Score'] >= 4.0]
```

<div class="table-wrapper" markdown="block">
<table>
  <thead>
    <tr>
      <th>Partner</th>
      <th>Score</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>64P2G1</th>
      <td>4.440000</td>
    </tr>
    <tr>
      <th>7Q9M2I</th>
      <td>5.000000</td>
    </tr>
    <tr>
      <th>886VOM</th>
      <td>4.352941</td>
    </tr>
    <tr>
      <th>91DHOD</th>
      <td>4.466667</td>
    </tr>
    <tr>
      <th>9EDN58</th>
      <td>4.904762</td>
    </tr>
    <tr>
      <th>FJGVQ4</th>
      <td>4.400000</td>
    </tr>
    <tr>
      <th>GXBENY</th>
      <td>4.800000</td>
    </tr>
    <tr>
      <th>J08XUI</th>
      <td>4.916667</td>
    </tr>
    <tr>
      <th>J4WJ99</th>
      <td>5.000000</td>
    </tr>
    <tr>
      <th>KKIBJ3</th>
      <td>4.600000</td>
    </tr>
    <tr>
      <th>MEN2KH</th>
      <td>4.448276</td>
    </tr>
    <tr>
      <th>OGZ5KO</th>
      <td>4.500000</td>
    </tr>
    <tr>
      <th>P1ENTH</th>
      <td>4.432432</td>
    </tr>
    <tr>
      <th>P5QA3E</th>
      <td>4.785714</td>
    </tr>
    <tr>
      <th>Q7XKWO</th>
      <td>5.000000</td>
    </tr>
    <tr>
      <th>RGN5S7</th>
      <td>4.083333</td>
    </tr>
    <tr>
      <th>TIA4D5</th>
      <td>4.363636</td>
    </tr>
    <tr>
      <th>TT7NS2</th>
      <td>4.590909</td>
    </tr>
    <tr>
      <th>XO55ZB</th>
      <td>4.636364</td>
    </tr>
    <tr>
      <th>ZZG4ZD</th>
      <td>4.666667</td>
    </tr>
  </tbody>
</table>
</div>

After verification, a list of values containing the partner ID is generated.

```python
df2_score_threshold = df2_score_threshold[df2_score_threshold['Score'] >= 4.0].index.values.tolist()
df2_score_threshold
```

    ['64P2G1',
     '7Q9M2I',
     '886VOM',
     '91DHOD',
     '9EDN58',
     'FJGVQ4',
     'GXBENY',
     'J08XUI',
     'J4WJ99',
     'KKIBJ3',
     'MEN2KH',
     'OGZ5KO',
     'P1ENTH',
     'P5QA3E',
     'Q7XKWO',
     'RGN5S7',
     'TIA4D5',
     'TT7NS2',
     'XO55ZB',
     'ZZG4ZD']

The final filter will be to determine which business partners meet the criterion of more than 90% good feedback across all categories.

```python
df2_categorical_threshold = df2[df2['Partner'].isin(df2_score_threshold)]
df2_gold_possible = df2_categorical_threshold[(df2_categorical_threshold['UX']=='Good') &
                                              (df2_categorical_threshold['Transaction Experience']=='Good') &
                                              (df2_categorical_threshold['Process Quality']=='Good')].groupby('Partner').size() /\
                                               df2_categorical_threshold.groupby(['Partner'])[['UX',
                                                                                               'Transaction Experience',
                                                                                               'Process Quality']].size() * 100
print(df2_gold_possible[df2_gold_possible >= 90.0])
print("\nTotal partners with 90%+ Good ratings: ", sum(df2_gold_possible >= 90.0))
```

    Partner
    7Q9M2I    100.000000
    91DHOD     93.333333
    9EDN58    100.000000
    J08XUI    100.000000
    J4WJ99     92.307692
    KKIBJ3     90.000000
    dtype: float64

    Total partners with 90%+ Good ratings:  6

## 3. - Considerations for a production environment

Generally speaking, when moving to production code one must follow the D.R.Y. principle: Do not Repeat Yourself. Therefore, it is always easier to establish functions for repetitive tasks such as periodic analysis of data that conveys the same information.

In this particular case, if the company wanted to analyze which business partners are ready to qualify for "Gold" on a regular basis, it would be best to define a function that can automatically extract this information rather than explore the same data set every time. This also assumes that data labels and categories will remain unchanged. By abstracting the exploratory analysis above, a sequence of processes can be strung together in a custom function.

To move a bit beyond the base data, I offered a recommendation that the three main criteria have default values so that in the future anybody can grab this function and also use it in a modelling capacity. By varying any or all of the three criteria and comparing with other references, the business can decide if lowering or raising the limits is beneficial or not.

```python
def gold_potential(df, mean_rating=4.0, min_revs=10, min_cat_thresh=90.0):
    """
    This function will filter a DataFrame for the specified criteria:
    - Minimum sample size of reviews, min_revs: default = 10 reviews
    - Avg. user rating, mean_rating: default = 4.0
    - Min percentage of responses "Good" in all categories, min_cat_thresh: default = 90.0%
    """
    criteria = {'Mean rating':mean_rating,
                'Minimum reviews':min_revs,
                'Minimum categorical %':min_cat_thresh}

    # Counting the miniumin specified reviews
    df_feedback_count = pd.DataFrame(df.groupby('Partner')['Date'].count())
    feedback_thresh_list = df_feedback_count[df_feedback_count['Date'] >= min_revs].index.values.tolist()

    # Adding minimum reviews as a filter and selecting an average rating greater than the specified minimum
    df_score_thresh = df[df['Partner'].isin(feedback_thresh_list)]
    df_score_thresh = pd.DataFrame(df_score_thresh.groupby('Partner')['Score'].mean())
    score_thresh_list = df_score_thresh[df_score_thresh['Score'] >= mean_rating].index.values.tolist()

    # Finding which of the filtered data also has 90% Great in all categories
    df_category_thresh = df[df['Partner'].isin(score_thresh_list)]

    categories_cols = ['UX', 'Transaction Experience', 'Process Quality']

    categories_check = ((df_category_thresh[categories_cols[0]]=='Good') &
                        (df_category_thresh[categories_cols[1]]=='Good') &
                        (df_category_thresh[categories_cols[2]]=='Good'))

    category_thresh_list = df_category_thresh[categories_check].groupby('Partner').size() /\
                                df_category_thresh.groupby(['Partner'])[categories_cols].size() * 100

    return print(criteria, "\n", category_thresh_list[category_thresh_list >= min_cat_thresh],
                 "\nTotal partners ready for gold: ", sum(category_thresh_list >= min_cat_thresh), "\n")

# Exploring various possibilites with the function
gold_potential(df2)
gold_potential(df2, mean_rating=4.5, min_revs=8, min_cat_thresh=80.0)
```

    {'Mean rating': 4.0, 'Minimum reviews': 10, 'Minimum categorical %': 90.0}
     Partner
    7Q9M2I    100.000000
    91DHOD     93.333333
    9EDN58    100.000000
    J08XUI    100.000000
    J4WJ99     92.307692
    KKIBJ3     90.000000
    dtype: float64
    Total partners ready for gold:  6

    {'Mean rating': 4.5, 'Minimum reviews': 8, 'Minimum categorical %': 80.0}
     Partner
    7Q9M2I    100.000000
    9EDN58    100.000000
    GXBENY     80.000000
    J08XUI    100.000000
    J4WJ99     92.307692
    KKIBJ3     90.000000
    P5QA3E     85.714286
    Q7XKWO     84.615385
    XO55ZB     81.818182
    dtype: float64
    Total partners ready for gold:  9

### 3.1 - A pipeline concept

Being limited in what I can demonstrate due to confidentiality, I chose to abstract at a high level what a potential production pipeline could look like. I'm generalizing here and these steps should adapt to a particular business's data environment and analytical use case.

The data pipeline should contain these important steps:

- Importing data
- Cleaning data
- Exploratory analysis
- Data manipulation

```python

def file_import(files):
    # Read in files with appropriate methods

def clean_import(df):
    # Drop or backfill missing values

def explore_data(df):
    # Find the most important features and correlations
    # Apply visualizations if required

def data_manipulation(df):
    # Combine and aggregate relevant data to gain insights
    return business_intellegence
```

If using machine learning techniques it is the same up to data_manipulation, which becomes data_learning and has these additional steps:

- Training and testing data
- Model training
- Model validation and metrics

```python

def file_import(files):
    # Read in files with appropriate methods

def clean_import(df):
    # Drop or backfill missing values

def explore_data(df):
    # Find the most important features and correlations
    # Apply visualizations if required

def data_learning(df):
    # Manipulate data and split into train and test sets
    return training_data, test_data

def train_model(training_data, test_data):
    # Train machine learning model
    return model

def validate_model(train_test_split, model):
    # Apply k-fold cross validation
    # Generate metrics
    return metrics
```
