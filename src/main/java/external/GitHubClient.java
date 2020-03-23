package external;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.json.JSONArray;
import org.json.JSONObject;

import entity.Item;
import entity.Item.ItemBuilder;



public class GitHubClient {
	private static final String URL = "https://jobs.github.com/positions.json?description=%s&lat=%s&long=%s";
	private static final String DEFAULT_KEYWORD = "developer";

	
	
//	public List<Item> search(double lat, double lon, String keyword) {
	public List<Item> search(double lat, double lon, String keyword) {
		
		// prepare HTTP request parameter
		if (keyword == null) {
			keyword = DEFAULT_KEYWORD;
		}
		// encode to resolve special signs, eg: &, = in parameter value
		try {
			keyword = URLEncoder.encode(keyword, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String url = String.format(URL, keyword, lat, lon);
		
		// create one instance for use - httpClient instance
		CloseableHttpClient httpClient = HttpClients.createDefault();
		try {
			// send HTTP get request
			CloseableHttpResponse response = httpClient.execute(new HttpGet(url));
			// check response status code
			if (response.getStatusLine().getStatusCode() != 200) {
				return new ArrayList<>();
			}
			HttpEntity entity = response.getEntity();
			// check if response content is null or not
			if (entity == null) {
				return new ArrayList<>();
			}
			// read the content from entity, byte stream
			// InputStreamReader ==> reads & decode byte stream into character streams
			// BufferedStreamReader ==> read character stream line by line very efficiently
			BufferedReader reader = new BufferedReader(new InputStreamReader(entity.getContent()));
			StringBuilder responseBody = new StringBuilder();
			String line = null;
			while ((line = reader.readLine())!=null) {
				responseBody.append(line);
			}
			JSONArray array = new JSONArray(responseBody.toString());
			return getItemList(array);
			
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		// Get HTTP response body
		return new ArrayList<>();
	}
	
	private List<Item> getItemList(JSONArray array) {
		List<Item> itemList = new ArrayList<>();
//		List<String> descriptionList = new ArrayList<>();
//		for (int i = 0; i < array.length(); i++) {
//			// We need to extract keywords from description since GitHub API
//			// doesn't return keywords.
//			String description = getStringFieldOrEmpty(array.getJSONObject(i), "description");
//			if (description.equals("") || description.equals("\n")) {
//				descriptionList.add(getStringFieldOrEmpty(array.getJSONObject(i), "title"));
//			} else {
//				descriptionList.add(description);
//			}	
//		}
//
//		// We need to get keywords from multiple text in one request since
//		// MonkeyLearnAPI has limitation on request per minute.
//		List<List<String>> keywords = MonkeyLearnClient
//				.extractKeywords(descriptionList.toArray(new String[descriptionList.size()]));
		
		for (int i=0; i<array.length(); i++) {
			JSONObject object = array.getJSONObject(i);
			ItemBuilder builder = new ItemBuilder();
			builder.setItemId(getStringFieldOrEmpty(object, "id"));
			builder.setName(getStringFieldOrEmpty(object, "title"));
			builder.setCompany(getStringFieldOrEmpty(object, "company"));
			builder.setAddress(getStringFieldOrEmpty(object, "location"));
			builder.setUrl(getStringFieldOrEmpty(object, "url"));
			builder.setImageUrl(getStringFieldOrEmpty(object, "company_logo"));
//			builder.setKeywords(new HashSet<String>(keywords.get(i)));
			itemList.add(builder.build());
		}
		
		return itemList;
	}
	
	private String getStringFieldOrEmpty(JSONObject obj, String field) {
		return obj.isNull(field) ? "" : obj.getString(field);
	}


}
