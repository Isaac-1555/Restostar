# Database Architecture – Restostar (Convex)

## Users
- id
- clerkUserId
- name
- email
- createdAt

## Restaurants
- id
- ownerId (Users.id)
- name
- logoUrl
- googleMapsUrl
- createdAt

## Coupons
- id
- restaurantId
- sentimentType (positive/negative)
- title
- description
- discountValue
- isSingleUse
- createdAt

## Reviews
- id
- restaurantId
- stars
- feedbackText
- isPublic
- createdAt

## CustomerCoupons
- id
- reviewId
- email
- couponCode
- isRedeemed
- redeemedAt
- sentAt

## AIInsights
- id
- restaurantId
- timeRange (daily/monthly/all)
- sentimentSummary
- keyComplaints
- suggestions
- generatedAt
