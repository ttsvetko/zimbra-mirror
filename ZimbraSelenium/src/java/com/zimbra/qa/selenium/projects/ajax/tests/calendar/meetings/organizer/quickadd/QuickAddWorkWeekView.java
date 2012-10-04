package com.zimbra.qa.selenium.projects.ajax.tests.calendar.meetings.organizer.quickadd;

import java.util.HashMap;
import org.testng.annotations.Test;
import com.zimbra.qa.selenium.framework.util.*;
import com.zimbra.qa.selenium.projects.ajax.core.CalendarWorkWeekTest;
import com.zimbra.qa.selenium.projects.ajax.ui.calendar.QuickAddAppointment;

public class QuickAddWorkWeekView extends CalendarWorkWeekTest {

	public QuickAddWorkWeekView() {
		logger.info("New "+ QuickAddWorkWeekView.class.getCanonicalName());

		// All tests start at the Calendar page
		super.startingPage = app.zPageCalendar;

		// Make sure we are using an account with work week view
		super.startingAccountPreferences = new HashMap<String, String>() {
			private static final long serialVersionUID = -2913827779459595178L;
		{
		    put("zimbraPrefCalendarInitialView", "workWeek");
		}};
	}
	
	@Test( description = "Verify quick add dialog opens after hitting new appointment in work week view",
			groups = { "sanity" } )
	
	public void QuickAddWorkWeekView_01() throws HarnessException {
			
		// Verify quick add dialog opened
		QuickAddAppointment quickAddAppt = new QuickAddAppointment(app) ;
		quickAddAppt.zNewAppointment();
		quickAddAppt.zVerifyQuickAddDialog(true);
		
		/* Meeting invite full verification is already covered by meetings.organizer.minicalendar testcases so
		 not validating over here and avoiding duplication */
		
		/* If we find out something else in the future then will add verification accordingly */
	}

}
