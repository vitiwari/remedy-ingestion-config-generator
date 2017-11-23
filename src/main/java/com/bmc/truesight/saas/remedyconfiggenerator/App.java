package com.bmc.truesight.saas.remedyconfiggenerator;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bmc.arsys.api.ARException;
import com.bmc.arsys.api.ARServerUser;
import com.bmc.arsys.api.AttachmentField;
import com.bmc.arsys.api.CharacterField;
import com.bmc.arsys.api.Constants;
import com.bmc.arsys.api.CurrencyField;
import com.bmc.arsys.api.DateOnlyField;
import com.bmc.arsys.api.DateTimeField;
import com.bmc.arsys.api.DecimalField;
import com.bmc.arsys.api.DiaryField;
import com.bmc.arsys.api.EnumItem;
import com.bmc.arsys.api.Field;
import com.bmc.arsys.api.IntegerField;
import com.bmc.arsys.api.RealField;
import com.bmc.arsys.api.SelectionField;
import com.bmc.arsys.api.SelectionFieldLimit;
import com.bmc.arsys.api.TimeOnlyField;
import com.bmc.truesight.saas.remedy.integration.ARServerForm;
import com.bmc.truesight.saas.remedy.integration.RemedyReader;
import com.bmc.truesight.saas.remedy.integration.impl.GenericRemedyReader;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

public class App {
	private final static Logger log = LoggerFactory.getLogger(App.class);

	static String hostName;
	static String portNo;
	static String userName;
	static String password;
	static boolean exportToFile;
	static String formName;
	static String fileName; 

	public static void main(String[] args) {
		if (args.length > 1) {
			System.out.println("Only log level is accepted as an argument");
		} else if (args.length == 1) {
			setLoglevel(args[0]);
		}
		Scanner sc = new Scanner(System.in);
		System.out.println("Please enter the following details.");
		System.out.print("Host name:");
		hostName = sc.next();
		System.out.print("Port no <Hit enter for default>:");
		portNo = sc.next();
		System.out.print("User Id:");
		userName = sc.next();
		System.out.print("Password:");
		password = sc.next();
		System.out.println("Export the results into a csv file ?(y/n):");
		System.out.println("_____________________________");
		System.out.println("1. Incidents Template Generation");
		System.out.println("2. Change Template Generation ");
		System.out.println("_____________________________");
		System.out.print("Enter Your Choice(1/2): ");
		int choice = sc.nextInt();
		RemedyReader reader = new GenericRemedyReader();
		int port = 0;
		if (portNo != null && !portNo.equalsIgnoreCase("")) {
			log.debug("port number set as {}", portNo);
			port = Integer.parseInt(portNo);
		}
		ARServerUser user = reader.createARServerContext(hostName, port, userName, password);
		switch (choice) {
		case 1:
			formName = ARServerForm.INCIDENT_FORM.toString();
			log.debug("form name set as {}", formName);
			fileName = "incident_generated_template.json";
			break;
		case 2:
			formName = ARServerForm.CHANGE_FORM.toString();
			log.debug("form name set as {}", formName);
			fileName = "change_generated_template.json";
			break;
		default:
			System.out.println("Wrong choice.. bye bye!");
			System.exit(1);
		}
		Map<String, FieldItem> definitionMap = getfieldDefinitionMap(user);
		Map<String, String> properties = new HashMap<String, String>();
		properties.put("app_id", "Remedy");
		properties.put("Last_Modified_Date", "@LAST_MODIFIED_DATE");
		TSIEvent eventDefinition = new TSIEvent();
		eventDefinition.setProperties(properties);
		Template template = new Template();
		Configuration config = getConfiguration(user);
		template.setConfig(config);
		template.setEventDefinition(eventDefinition);

		template.setFieldDefinitionMap(definitionMap);
		ObjectMapper objectMapper = new ObjectMapper();
		ObjectWriter writer = objectMapper.writer(new DefaultPrettyPrinter());
		try {
			writer.writeValue(new File(fileName), template);
			System.out.println("Configuration file generated, Please run the index.html for further processing...");
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private static Map<String, FieldItem> getfieldDefinitionMap(ARServerUser user) {
		Map<String, FieldItem> definitionMap = new HashMap<String, FieldItem>();
		try {
			List<Field> fieldList = user.getListFieldObjects(formName);
			log.debug("Recieved {} list of fields from ARServer", fieldList.size());
			for (Field field : fieldList) {
				FieldItem item = new FieldItem();
				item.setFieldId(field.getFieldID());
				item.setFieldInstance(getFieldInstance(field).toString());
				item.setFieldType(getFieldType(field.getFieldType()));
				item.setFieldName(field.getName());
				item.setValueMap(getValueMap(field));
				definitionMap.put(capitalizeAndReplaceSpace(field.getName()), item);
			}

		} catch (ARException e) {
			log.error("AREXCEPTION : {}", e.getMessage());
		}
		return definitionMap;
	}

	private static Configuration getConfiguration(ARServerUser user) {
		Configuration config = new Configuration();
		config.setRemedyHostName(hostName);
		int port = 0;
		if (portNo != null && !portNo.equalsIgnoreCase("")) {
			port = Integer.parseInt(portNo);
		}
		config.setRemedyPort(port);
		config.setRemedyUserName(userName);
		config.setRemedyPassword(password);
		config.setQueryStatusList(getStatusList(user));
		config.setTsiEventEndpoint("https://api.truesight.bmc.com/v1/events");
		config.setTsiApiToken("");
		config.setConditionFields(getConditionFields());
		config.setRetryConfig(2);
		config.setWaitMsBeforeRetry(5000);
		config.setStartDateTime(new Date());
		config.setEndDateTime(new Date());
		return config;
	}

	private static List<Integer> getConditionFields() {
		List<Integer> fieldlist = new ArrayList<Integer>();
		fieldlist.add(3);
		fieldlist.add(6);
		return fieldlist;
	}

	private static List<Integer> getStatusList(ARServerUser user) {
		List<Integer> values = new ArrayList();
		Field field;
		try {
			field = user.getField(formName, 7);
			if (field instanceof SelectionField) {
				SelectionFieldLimit sFieldLimit = (SelectionFieldLimit) field.getFieldLimit();
				if (sFieldLimit != null) {
					List<EnumItem> eItemList = sFieldLimit.getValues();
					for (EnumItem eItem : eItemList) {
						values.add(eItem.getEnumItemNumber());
					}
				}
			} else {
				log.debug("Given fieldId is not a selection field");
			}
		} catch (ARException e) {
			e.printStackTrace();
		}
		return values;
	}

	private static String capitalizeAndReplaceSpace(String name) {
		name = name.replace(" ", "_");
		name = name.toUpperCase();
		return "@".concat(name);
	}

	private static Map<String, String> getValueMap(Field field) {
		Map<String, String> valueMap = new HashMap<String, String>();
		if (field instanceof SelectionField) {
			SelectionFieldLimit sFieldLimit = (SelectionFieldLimit) field.getFieldLimit();
			if (sFieldLimit != null) {
				List<EnumItem> eItemList = sFieldLimit.getValues();
				for (EnumItem eItem : eItemList) {
					valueMap.put(Integer.toString(eItem.getEnumItemNumber()), eItem.getEnumItemName());
				}
			}
		} else {
			valueMap = null;
			log.debug("Given fieldId {} is not a selection field", field.getFieldID());
		}
		return valueMap;
	}

	private static String getFieldType(Integer type) {
		switch (type) {
		case Constants.AR_FIELD_TYPE_DATA:
			return Constants.AR_FIELD_TYPE_DATA + ":AR_FIELD_TYPE_DATA";
		case Constants.AR_FIELD_TYPE_ALL:
			return Constants.AR_FIELD_TYPE_ALL + ":AR_FIELD_TYPE_ALL";
		case Constants.AR_FIELD_TYPE_ATTACH:
			return Constants.AR_FIELD_TYPE_ATTACH + ":AR_FIELD_TYPE_ATTACH";
		case Constants.AR_FIELD_TYPE_ATTACH_POOL:
			return Constants.AR_FIELD_TYPE_ATTACH_POOL + ":AR_FIELD_TYPE_ATTACH_POOL";
		case Constants.AR_FIELD_TYPE_COLUMN:
			return Constants.AR_FIELD_TYPE_COLUMN + ":AR_FIELD_TYPE_COLUMN";
		case Constants.AR_FIELD_TYPE_PAGE:
			return Constants.AR_FIELD_TYPE_PAGE + ":AR_FIELD_TYPE_DATA";
		case Constants.AR_FIELD_TYPE_PAGE_HOLDER:
			return Constants.AR_FIELD_TYPE_PAGE_HOLDER + ":AR_FIELD_TYPE_DATA";
		case Constants.AR_FIELD_TYPE_TABLE:
			return Constants.AR_FIELD_TYPE_TABLE + ":AR_FIELD_TYPE_DATA";
		case Constants.AR_FIELD_TYPE_TRIM:
			return Constants.AR_FIELD_TYPE_TRIM + ":AR_FIELD_TYPE_DATA";
		default:
			return "UNKNOWN_FIELD_TYPE";
		}
	}

	private static FieldInstance getFieldInstance(Field field) {
		if (field instanceof CharacterField) {
			return FieldInstance.CharacterField;
		}
		if (field instanceof DateTimeField) {
			return FieldInstance.DateTimeField;
		}
		if (field instanceof DateOnlyField) {
			return FieldInstance.DateOnlyField;
		}
		if (field instanceof CurrencyField) {
			return FieldInstance.CurrencyField;
		}
		if (field instanceof DecimalField) {
			return FieldInstance.DecimalField;
		}
		if (field instanceof DiaryField) {
			return FieldInstance.DiaryField;
		}
		if (field instanceof IntegerField) {
			return FieldInstance.IntegerField;
		}
		if (field instanceof RealField) {
			return FieldInstance.RealField;
		}
		if (field instanceof AttachmentField) {
			return FieldInstance.AttachmentField;
		}
		if (field instanceof SelectionField) {
			return FieldInstance.SelectionField;
		}
		if (field instanceof TimeOnlyField) {
			return FieldInstance.TimeOnlyField;
		}
		return FieldInstance.UnknownField;
	}

	private static void setLoglevel(String module) {
		switch (module) {
		case "ALL":
		case "all":
			LogManager.getLogger("com.bmc.truesight").setLevel(Level.ALL);
		case "DEBUG":
		case "debug":
			LogManager.getLogger("com.bmc.truesight").setLevel(Level.DEBUG);
			break;
		case "ERROR":
		case "error":
			LogManager.getLogger("com.bmc.truesight").setLevel(Level.ERROR);
			break;
		case "FATAL":
		case "fatal":
			LogManager.getLogger("com.bmc.truesight").setLevel(Level.FATAL);
			break;
		case "INFO":
		case "info":
			LogManager.getLogger("com.bmc.truesight").setLevel(Level.INFO);
			break;
		case "OFF":
		case "off":
			LogManager.getLogger("com.bmc.truesight").setLevel(Level.OFF);
			break;
		case "TRACE":
		case "trace":
			LogManager.getLogger("com.bmc.truesight").setLevel(Level.TRACE);
			break;
		case "WARN":
		case "warn":
			LogManager.getLogger("com.bmc.truesight").setLevel(Level.WARN);
			break;
		default:
			log.error("Argument \"{}\" is not a valid log level, please use a valid log level (ex debug).", module);
			System.exit(0);
		}
	}
}