import { Restaurant, SearchParams } from "../types/restaurant";

// 임시 데이터
const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "맛있는 한식당",
    image: "/images/restaurant1.jpg",
    rating: 4.5,
    priceLevel: 2,
    distance: 0.5,
    address: "서울시 강남구",
    cuisine: "한식",
    reviews: 128,
  },
  {
    id: "2",
    name: "이탈리안 레스토랑",
    image: "/images/restaurant2.jpg",
    rating: 4.2,
    priceLevel: 3,
    distance: 1.2,
    address: "서울시 서초구",
    cuisine: "이탈리안",
    reviews: 85,
  },
  // 추가 레스토랑 데이터...
];

export const searchRestaurants = async (params: SearchParams): Promise<Restaurant[]> => {
  // 실제 API 호출 대신 임시 필터링 로직 구현
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredRestaurants = [...mockRestaurants];

      if (params.query) {
        const query = params.query.toLowerCase();
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(query) ||
            restaurant.cuisine.toLowerCase().includes(query) ||
            restaurant.address.toLowerCase().includes(query)
        );
      }

      if (params.minRating) {
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant) => restaurant.rating >= params.minRating!
        );
      }

      if (params.maxDistance) {
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant) => restaurant.distance <= params.maxDistance!
        );
      }

      if (params.priceLevel) {
        filteredRestaurants = filteredRestaurants.filter(
          (restaurant) => restaurant.priceLevel <= params.priceLevel!
        );
      }

      resolve(filteredRestaurants);
    }, 500); // 0.5초 지연
  });
};
