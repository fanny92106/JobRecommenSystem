package recommendation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import db.MySQLConnection;
import entity.Item;
import external.GitHubClient;

public class Recommendation {
	public List<Item> recommendItems(String userId, double lat, double lon){
		// get favorite items Ids
		List<Item> recommendedItems = new ArrayList<>();
		MySQLConnection connection = new MySQLConnection();
		Set<String> favoritedItemIds = connection.getFavoriteItemIds(userId);
		
		
		// store all keywords & count in map
		Map<String, Integer> allKeywords = new HashMap<>();
		for(String itemId: favoritedItemIds) {
			Set<String> keywords = connection.getKeywords(itemId);
			for(String keyword: keywords) {
				allKeywords.put(keyword, allKeywords.getOrDefault(keyword, 0)+1);
			}
		}
		
		connection.close();
		
		// sort keywords by count in descending order
		List<Entry<String, Integer>> keywordList = new ArrayList<>(allKeywords.entrySet());
		Collections.sort(keywordList, (Entry<String, Integer> e1, Entry<String, Integer> e2) -> {
			return Integer.compare(e2.getValue(), e1.getValue());
		});
		
		
		// select top 3 keywords
		if(keywordList.size()>3) {
			keywordList = keywordList.subList(0, 3);
		}
		
		// search jobs using keywords in github client
		Set<String> visitedItemIds = new HashSet<>();
		GitHubClient client = new GitHubClient();
		
		for(Entry<String, Integer> keyword: keywordList) {
			List<Item> items = client.search(lat, lon, keyword.getKey());
			
			for(Item item: items) {
				if(!favoritedItemIds.contains(item.getItemId()) && !visitedItemIds.contains(item.getItemId())) {
					recommendedItems.add(item);
					visitedItemIds.add(item.getItemId());
				}
			}
		}
		return recommendedItems;
	}
}
