package rpc;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import db.MySQLConnection;

/**
 * Servlet implementation class Register
 */
public class Register extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public Register() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// parse request body binary stream
		JSONObject input = RpcHelper.readJSONObject(request);
		
		// read JSONObj
		String userId = input.getString("user_id");
		String password = input.getString("password");
		String firstname = input.getString("first_name");
		String lastname = input.getString("last_name");
		
		// db operation: add user into user table
		// prepare response JSONObj
		MySQLConnection connection = new MySQLConnection();
		JSONObject obj = new JSONObject();
		if (connection.addUser(userId, password, firstname, lastname)) {
			obj.put("status", "OK");
		} else {
			obj.put("status", "User Already Exists.");
		}
		connection.close();
		// respond back to client
		RpcHelper.writeJsonObject(response, obj);
	}
}
