﻿using System;
using System.IO;
using System.Diagnostics;
using System.ComponentModel;
using System.Windows;
using System.Windows.Input;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading;
using MVVM.Model;
using CssLib;
using Misc;

namespace MVVM.ViewModel
{
    public class ScheduleViewModel : BaseViewModel
    {
        readonly Schedule m_schedule = new Schedule(0, "", false);
        UsersViewModel usersViewModel;
        ConfigViewModelU configViewModelU;
        AccountResultsViewModel accountResultsViewModel;
        BackgroundWorker bgw;

        public ScheduleViewModel()
        {
            this.ScheduleTaskCommand = new ActionCommand(this.ScheduleTask, () => true);
            this.GetSchedHelpCommand = new ActionCommand(this.GetSchedHelp, () => true);
            this.LoadCommand = new ActionCommand(this.Load, () => true);
            this.SaveCommand = new ActionCommand(this.Save, () => true);
            this.MigrateCommand = new ActionCommand(this.Migrate, () => true);
            this.usersViewModel = null;
        }

        public ConfigViewModelU GetConfigUModel()
        {
            return configViewModelU;
        }

        public void SetConfigUModel(ConfigViewModelU configViewModelU)
        {
            this.configViewModelU = configViewModelU;
        }

        public UsersViewModel GetUsersViewModel()
        {
            return usersViewModel;
        }

        public void SetUserModel(UsersViewModel usersViewModel)
        {
            this.usersViewModel = usersViewModel;
        }

        public void SetResultsModel(AccountResultsViewModel accountResultsViewModel)
        {
            this.accountResultsViewModel = accountResultsViewModel;
        }

        public BackgroundWorker GetBGW()
        {
            return bgw;
        }

        // Commands

        public ICommand ScheduleTaskCommand
        {
            get;
            private set;
        }

        private void ScheduleTask()
        {
            /*
            OperatingSystem os = System.Environment.OSVersion;
            Version v = os.Version;
            string strTaskScheduler = Environment.GetEnvironmentVariable("SYSTEMROOT");

            if (v.Major >= 6)
            {
                strTaskScheduler += "\\system32\\taskschd.msc";
                System.Diagnostics.Process.Start(@strTaskScheduler);
            }
            else
            {
                strTaskScheduler += "\\system32\\control";
                System.Diagnostics.Process proc = new System.Diagnostics.Process();
                proc.StartInfo.FileName = strTaskScheduler;
                proc.StartInfo.Arguments = "schedtasks";
                proc.Start();
            }
            */

            OperatingSystem os = System.Environment.OSVersion;
            Version v = os.Version;

            System.Diagnostics.Process proc = new System.Diagnostics.Process();
            proc.StartInfo.FileName = "c:\\windows\\system32\\schtasks.exe";

            // set up date, time, and name for task scheduler
            string dtStr = Convert.ToDateTime(this.ScheduleDate).ToString("MM/dd/yyyy");  // formatting in C# is nuts -- only way to get this to work
            string dtTime = MakeTimeStr();
            string dtName = "Migrate" + dtTime.Substring(0, 2) + dtTime.Substring(3, 2);
            //

            if (v.Major >= 6)
            {
                proc.StartInfo.Arguments = "/Create /SC ONCE /TR C:\\depot\\main\\ZimbraMigrationTools\\src\\c\\out\\dbg\\ZimbraMigration.exe /F /Z /V1" + " /TN " + dtName + " /SD " + dtStr + " /ST " + dtTime;
            }
            else
            {
                proc.StartInfo.Arguments = "/Create /SC ONCE /TR C:\\depot\\main\\ZimbraMigrationTools\\src\\c\\out\\dbg\\ZimbraMigration.exe" + " /TN " + dtName + " /SD " + dtStr + " /ST " + dtTime;
            }
            proc.Start();
        }

        // Commands
        public ICommand GetSchedHelpCommand
        {
            get;
            private set;
        }

        private void GetSchedHelp()
        {
            string urlString = (isBrowser) ? "http://10.20.140.218/sched.html" : "file:///C:/depot/main/ZimbraMigrationTools/src/c/Misc/Help/sched.html";
            Process.Start(new ProcessStartInfo(urlString));
        }

        public ICommand LoadCommand
        {
            get;
            private set;
        }

        private void Load()
        {
            System.Xml.Serialization.XmlSerializer reader =
          new System.Xml.Serialization.XmlSerializer(typeof(Config));
            if (File.Exists(@"C:\Temp\ZimbraAdminOverView.xml"))
            {
                System.IO.StreamReader fileRead = new System.IO.StreamReader(
                   @"C:\Temp\ZimbraAdminOverView.xml");
                Config Z11 = new Config();
                Z11 = (Config)reader.Deserialize(fileRead);
                fileRead.Close();
                COS = Z11.UserProvision.COS;
                DefaultPWD = Z11.UserProvision.DefaultPWD;
                
                //MessageBox.Show("Options information loaded", "Zimbra Migration", MessageBoxButton.OK, MessageBoxImage.Exclamation);
            }
            else
            {
                MessageBox.Show("There is no options configuration stored.Please enter some options info", "Zimbra Migration", MessageBoxButton.OK, MessageBoxImage.Error);
            }

            //MessageBox.Show("Schedule information loaded", "Zimbra Migration", MessageBoxButton.OK, MessageBoxImage.Exclamation);
        }

        public ICommand SaveCommand
        {
            get;
            private set;
        }

        private void Save()
        {
            if (File.Exists(@"C:\Temp\ZimbraAdminOverView.xml"))
                UpdateXmlElement(@"C:\Temp\ZimbraAdminOverView.xml", "UserProvision");
            else
            {
                System.Xml.Serialization.XmlSerializer writer =
                new System.Xml.Serialization.XmlSerializer(typeof(Config));

                System.IO.StreamWriter file = new System.IO.StreamWriter(
                    @"C:\Temp\ZimbraAdminOverView.xml");
                writer.Serialize(file, m_config);
                file.Close();
            }

            MessageBox.Show("Schedule information saved", "Zimbra Migration", MessageBoxButton.OK, MessageBoxImage.Exclamation);
        }

        public ICommand MigrateCommand
        {
            get;
            private set;
        }

        public void Migrate()
        {
            if (CurrentCOSSelection == -1)
            {
                CurrentCOSSelection = 0;
            }

            ZimbraAPI zimbraAPI = new ZimbraAPI();
            string domainName = usersViewModel.ZimbraDomain;
            string defaultPWD = DefaultPWD;
            string tempMessage = "";
            bool bProvision = false;
            for (int i = 0; i < SchedList.Count; i++)
            {
                if (!SchedList[i].isProvisioned)
                {
                    bProvision = true;
                    string userName = (usersViewModel.UsersList[i].MappedName.Length > 0) ? usersViewModel.UsersList[i].MappedName : usersViewModel.UsersList[i].Username;
                    string accountName = userName + "@" + domainName;
                    string cosID = CosList[CurrentCOSSelection].CosID;
                    if (zimbraAPI.CreateAccount(accountName, defaultPWD, cosID) == 0)
                    {
                        tempMessage += string.Format("{0} Provisioned", userName) + "\n";
                        //MessageBox.Show(string.Format("{0} Provisioned", userName), "Zimbra Migration", MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                    else
                    {
                        //MessageBox.Show(string.Format("Provision unsuccessful for {0}: {1}", userName, zimbraAPI.LastError), "Zimbra Migration", MessageBoxButton.OK, MessageBoxImage.Error);
                        tempMessage += string.Format("{0} Provisioned", userName) + "\n";
                    }
                }
            }
            if (bProvision)
            {
                MessageBox.Show(tempMessage, "Zimbra Migration", MessageBoxButton.OK, MessageBoxImage.Error);
            }

            lb.SelectedIndex = (isServer) ? 4 : 2;
            accountResultsViewModel.AccountResultsList.Clear();
            EnableMigrate = false;
            accountResultsViewModel.EnableStop = !EnableMigrate;

            bgw = new System.ComponentModel.BackgroundWorker();

            foreach (SchedUser su in SchedList)
            {
                accountResultsViewModel.AccountResultsList.Add(new AccountResultsViewModel(this, 0, "", su.username, 0, 0, 0, accountResultsViewModel.EnableStop));
            }

            bgw.DoWork += new System.ComponentModel.DoWorkEventHandler(worker_DoWork);
            bgw.ProgressChanged += new System.ComponentModel.ProgressChangedEventHandler(worker_ProgressChanged);
            bgw.WorkerReportsProgress = true;
            bgw.WorkerSupportsCancellation = true;
            bgw.RunWorkerCompleted += new System.ComponentModel.RunWorkerCompletedEventHandler(worker_RunWorkerCompleted);
            bgw.RunWorkerAsync();
        }
        ////////////////////////

        private ObservableCollection<SchedUser> schedlist = new ObservableCollection<SchedUser>();
        public ObservableCollection<SchedUser> SchedList
        {
            get
            {
                schedlist.Clear();
                foreach (UsersViewModel obj in usersViewModel.UsersList)
                {
                    schedlist.Add(new SchedUser(obj.Username, obj.IsProvisioned));
                }
                return schedlist;
            }
        }
        public string COS
        {
            get { return m_config.UserProvision.COS; }
            set
            {
                if (value == m_config.UserProvision.COS)
                {
                    return;
                }
                m_config.UserProvision.COS = value;

                OnPropertyChanged(new PropertyChangedEventArgs("COS"));
            }
        }
        public string DefaultPWD
        {
            get { return m_config.UserProvision.DefaultPWD; }
            set
            {
                if (value == m_config.UserProvision.DefaultPWD)
                {
                    return;
                }
                m_config.UserProvision.DefaultPWD = value;

                OnPropertyChanged(new PropertyChangedEventArgs("DefaultPWD"));
            }
        }

        public int PBValue
        {
            get { return m_schedule.PBValue; }
            set
            {
                if (value == m_schedule.PBValue)
                {
                    return;
                }
                m_schedule.PBValue = value;
                OnPropertyChanged(new PropertyChangedEventArgs("PBValue"));
            }
        }

        public string PBMsgValue
        {
            get { return m_schedule.PBMsgValue; }
            set
            {
                if (value == m_schedule.PBMsgValue)
                {
                    return;
                }
                m_schedule.PBMsgValue = value;
                OnPropertyChanged(new PropertyChangedEventArgs("PBMsgValue"));
            }
        }

        public bool EnableMigrate
        {
            get { return m_schedule.EnableMigrate; }
            set
            {
                if (value == m_schedule.EnableMigrate)
                {
                    return;
                }
                m_schedule.EnableMigrate = value;
                OnPropertyChanged(new PropertyChangedEventArgs("EnableMigrate"));
            }
        }

        private int cosSelection;
        public int CurrentCOSSelection
        {
            get { return cosSelection; }
            set
            {

                cosSelection = value;

                OnPropertyChanged(new PropertyChangedEventArgs("CurrentCOSSelection"));
            }
        }

        public string ScheduleDate
        {
            get { return m_schedule.ScheduleDate.ToShortDateString(); }
            set
            {
                if (value == m_schedule.ScheduleDate.ToShortDateString())
                {
                    return;
                }
                m_schedule.ScheduleDate = Convert.ToDateTime(value);

                OnPropertyChanged(new PropertyChangedEventArgs("ScheduleDate"));
            }
        }

        public int HrSelection
        {
            get { return m_schedule.HrSelection; }
            set
            {
                if (value == m_schedule.HrSelection)
                {
                    return;
                }
                m_schedule.HrSelection = value;
                OnPropertyChanged(new PropertyChangedEventArgs("HrSelection"));
            }
        }

        public int MinSelection
        {
            get { return m_schedule.MinSelection; }
            set
            {
                if (value == m_schedule.MinSelection)
                {
                    return;
                }
                m_schedule.MinSelection = value;
                OnPropertyChanged(new PropertyChangedEventArgs("MinSelection"));
            }
        }

        public int AMPMSelection
        {
            get { return m_schedule.AMPMSelection; }
            set
            {
                if (value == m_schedule.AMPMSelection)
                {
                    return;
                }
                m_schedule.AMPMSelection = value;
                OnPropertyChanged(new PropertyChangedEventArgs("AMPMSelection"));
            }
        }

        private string MakeTimeStr()
        {
            string retval = "";
            bool bAdd12 = (AMPMSelection == 1);

            switch (HrSelection)
            {
                case 0:  retval = (bAdd12) ? "13:" : "01:"; break;
                case 1:  retval = (bAdd12) ? "14:" : "02:"; break;
                case 2:  retval = (bAdd12) ? "15:" : "03:"; break;
                case 3:  retval = (bAdd12) ? "16:" : "04:"; break;
                case 4:  retval = (bAdd12) ? "17:" : "05:"; break;
                case 5:  retval = (bAdd12) ? "18:" : "06:"; break;
                case 6:  retval = (bAdd12) ? "19:" : "07:"; break;
                case 7:  retval = (bAdd12) ? "20:" : "08:"; break;
                case 8:  retval = (bAdd12) ? "21:" : "09:"; break;
                case 9:  retval = (bAdd12) ? "22:" : "10:"; break;
                case 10: retval = (bAdd12) ? "23:" : "11:"; break;
                case 11: retval = (bAdd12) ? "12:" : "00:"; break;
                default: retval = "00:";                    break;
            }

            switch (MinSelection)
            {
                case 0:     retval += "00:00"; break;
                case 1:     retval += "10:00"; break;
                case 2:     retval += "20:00"; break;
                case 3:     retval += "30:00"; break;
                case 4:     retval += "40:00"; break;
                case 5:     retval += "50:00"; break;
                default:    retval += "00:00"; break;
            }

            return retval;
        }

        private ObservableCollection<CosInfo> coslist = new ObservableCollection<CosInfo>();
        public ObservableCollection<CosInfo> CosList
        {
            get { return coslist; }
            set { coslist = value; }
        }

        //Background thread stuff
        private void worker_DoWork(object sender, System.ComponentModel.DoWorkEventArgs e)
        {
            while (accountResultsViewModel.PBValue != 100)
            {
                if (bgw.CancellationPending)
                {
                    e.Cancel = true;
                    return;
                }
                accountResultsViewModel.PBValue += 2;
                bgw.ReportProgress(accountResultsViewModel.PBValue);
                Thread.Sleep(250);
                System.Windows.Threading.Dispatcher.CurrentDispatcher.Invoke(System.Windows.Threading.DispatcherPriority.Background,
                                          new System.Threading.ThreadStart(delegate { }));
            }
        }

        private void worker_ProgressChanged(object sender, System.ComponentModel.ProgressChangedEventArgs e)
        {
            if (e.ProgressPercentage == 2)
            {
                accountResultsViewModel.PBMsgValue = "Migrating messages";
            }
            if (e.ProgressPercentage == 30)
            {
                accountResultsViewModel.PBMsgValue = "Migrating appointments";
            }
            if (e.ProgressPercentage == 60)
            {
                accountResultsViewModel.PBMsgValue = "Migrating contacts";
            }
            if (e.ProgressPercentage == 80)
            {
                accountResultsViewModel.PBMsgValue = "Migrating rules";
            }

            int i = 0;           
            foreach (SchedUser su in SchedList)
            {
                AccountResultsViewModel ar = accountResultsViewModel.AccountResultsList[i];
                // some fake stuff
                switch (i)
                {
                    case 0:
                        ar.AccountProgress = e.ProgressPercentage;
                        if ((e.ProgressPercentage % 15) == 0)
                        {
                            ar.NumWarns++;
                        }
                        if ((e.ProgressPercentage % 40) == 0)
                        {
                            ar.NumErrs++;
                        }
                        break;

                    case 1:
                        if ((e.ProgressPercentage == 10) || (e.ProgressPercentage == 100))
                        {
                            ar.AccountProgress = e.ProgressPercentage;
                        }
                        if (e.ProgressPercentage == 50)
                        {
                            ar.AccountProgress = e.ProgressPercentage + 7;
                        }
                        break;

                    case 2:
                        if ((e.ProgressPercentage == 20) || (e.ProgressPercentage == 100))
                        {
                            ar.AccountProgress = e.ProgressPercentage;
                        }
                        if (e.ProgressPercentage == 30)
                        {
                            ar.AccountProgress = e.ProgressPercentage - 12;
                            ar.NumErrs++;
                        }
                        if (e.ProgressPercentage == 66)
                        {
                            ar.AccountProgress = e.ProgressPercentage - 1;
                            ar.NumErrs++;
                        }
                        if (e.ProgressPercentage == 82)
                        {
                            ar.AccountProgress = e.ProgressPercentage;
                            ar.NumErrs++;
                        }
                        break;

                    case 3:
                        if ((e.ProgressPercentage == 10) || (e.ProgressPercentage == 100))
                        {
                            ar.AccountProgress = e.ProgressPercentage;
                        }
                        if (e.ProgressPercentage == 30)
                        {
                            ar.AccountProgress = e.ProgressPercentage - 8;
                            ar.NumErrs++;
                        }
                        if (e.ProgressPercentage == 50)
                        {
                            ar.AccountProgress = e.ProgressPercentage - 1;
                            ar.NumErrs++;
                        }
                        if (e.ProgressPercentage == 70)
                        {
                            ar.AccountProgress = e.ProgressPercentage - 3;
                            ar.NumErrs++;
                        }
                        if (e.ProgressPercentage == 82)
                        {
                            ar.AccountProgress = e.ProgressPercentage;
                            ar.NumErrs++;
                        }
                        break;

                    default:
                        ar.AccountProgress = e.ProgressPercentage;
                        break;
                }

                i++;
            }
            
        }

        private void worker_RunWorkerCompleted(object sender, System.ComponentModel.RunWorkerCompletedEventArgs e)
        {
            if (e.Cancelled)
            {
                accountResultsViewModel.PBMsgValue = "Migration canceled";
            }
            else if (e.Error != null)
            {
                accountResultsViewModel.PBMsgValue = "Migration exception: " + e.Error.ToString();
            }
            else
            {
                accountResultsViewModel.PBMsgValue = "Migration complete";
                EnableMigrate = false;
                accountResultsViewModel.EnableStop = false;
                SchedList.Clear();
                usersViewModel.UsersList.Clear();
            }
        }
    }
}
