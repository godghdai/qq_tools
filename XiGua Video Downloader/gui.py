import wx
import wx.xrc
import wx.richtext
from threading import Thread
from xigua.downloader import XiGuaDownloader


class DownloadThread(Thread):
    def __init__(self, url: str, frame):
        Thread.__init__(self)
        self.downloader = XiGuaDownloader()
        self.downloader.on("on_progress", self.on_progress)
        self.downloader.on("on_info", self.on_info)

        self.url = url
        self.frame = frame

    def on_progress(self, step):
        # wx.CallAfter(pub.sendMessage, "update", step=step)
        self.frame.update_display(step)

    def on_info(self, info):
        self.frame.update_info(info)

    def __del__(self):
        self.downloader.remove_listener("on_progress", self.on_progress)

    def run(self):
        self.downloader.download(self.url)


class XiGuaFrame(wx.Frame):

    def __init__(self, parent):
        wx.Frame.__init__(self, parent, id=wx.ID_ANY, title=u"西瓜视频下载", pos=wx.DefaultPosition, size=wx.Size(588, 315),
                          style=wx.DEFAULT_FRAME_STYLE | wx.STAY_ON_TOP | wx.TAB_TRAVERSAL)

        self.SetSizeHints(wx.Size(-1, -1), wx.DefaultSize)
        self.SetBackgroundColour(wx.SystemSettings.GetColour(wx.SYS_COLOUR_3DLIGHT))

        bSizerMain = wx.BoxSizer(wx.VERTICAL)

        bSizerRow1 = wx.BoxSizer(wx.HORIZONTAL)

        self.m_staticText_url = wx.StaticText(self, wx.ID_ANY, u"URL", wx.DefaultPosition, wx.Size(40, -1),
                                              wx.ALIGN_RIGHT)
        self.m_staticText_url.Wrap(-1)

        bSizerRow1.Add(self.m_staticText_url, 0, wx.ALIGN_CENTER_VERTICAL | wx.ALL, 5)

        self.m_textCtrl_url = wx.TextCtrl(self, wx.ID_ANY, wx.EmptyString, wx.DefaultPosition, wx.Size(-1, 25), 0)
        bSizerRow1.Add(self.m_textCtrl_url, 1, wx.ALL | wx.ALIGN_CENTER_VERTICAL, 5)

        self.m_button_download = wx.Button(self, wx.ID_ANY, u"下载", wx.DefaultPosition, wx.Size(80, -1), 0)

        self.m_button_download.SetBitmapPosition(wx.RIGHT)
        bSizerRow1.Add(self.m_button_download, 0, wx.ALL | wx.ALIGN_CENTER_VERTICAL | wx.EXPAND, 5)

        bSizerMain.Add(bSizerRow1, 0, wx.RIGHT | wx.LEFT | wx.EXPAND | wx.ALIGN_CENTER_HORIZONTAL, 0)

        bSizerRow2 = wx.BoxSizer(wx.HORIZONTAL)

        self.m_staticText_url11 = wx.StaticText(self, wx.ID_ANY, u"进度", wx.DefaultPosition, wx.Size(40, -1),
                                                wx.ALIGN_RIGHT)
        self.m_staticText_url11.Wrap(-1)

        bSizerRow2.Add(self.m_staticText_url11, 0, wx.ALIGN_CENTER_VERTICAL | wx.ALL, 5)

        self.m_gauge = wx.Gauge(self, wx.ID_ANY, 100, wx.DefaultPosition, wx.Size(-1, 25), wx.GA_HORIZONTAL)
        self.m_gauge.SetValue(0)
        bSizerRow2.Add(self.m_gauge, 1, wx.ALL | wx.ALIGN_CENTER_VERTICAL, 5)

        bSizerMain.Add(bSizerRow2, 0, wx.EXPAND, 5)

        bSizerRow3 = wx.BoxSizer(wx.HORIZONTAL)

        bSizerRow3.Add((40, 3), 0, wx.ALIGN_CENTER_VERTICAL | wx.ALL | wx.EXPAND, 5)

        self.m_richText_info = wx.richtext.RichTextCtrl(self, wx.ID_ANY, wx.EmptyString, wx.DefaultPosition,
                                                        wx.Size(-1, 200),
                                                        0 | wx.VSCROLL | wx.HSCROLL | wx.NO_BORDER | wx.WANTS_CHARS)
        bSizerRow3.Add(self.m_richText_info, 1, wx.ALL, 5)

        bSizerMain.Add(bSizerRow3, 0, wx.EXPAND, 0)

        self.SetSizer(bSizerMain)
        self.Layout()

        self.Centre(wx.BOTH)

        # Connect Events
        self.m_button_download.Bind(wx.EVT_LEFT_UP, self.clickup)
        self.m_richText_info.Disable()
        self.m_textCtrl_url.SetValue("https://www.ixigua.com/i6832441533485023757/?logTag=l6r5Zch4RoIqgpQmXIcxW")
        # pub.subscribe(self.update_display, "update")

    def __del__(self):
        pass
        # pub.unsubscribe(self.update_display, "update")

    def update_display(self, step):
        # self.m_richText_info.SetValue(info)
        if self.m_gauge:
            self.m_gauge.SetValue(step)

    def update_info(self, info):
        self.m_richText_info.SetValue(info)

    def clickup(self, event):
        thread = DownloadThread(self.m_textCtrl_url.GetValue(), self)
        thread.setDaemon(True)
        thread.start()
        event.Skip()


if __name__ == '__main__':
    app = wx.App()
    frame = XiGuaFrame(None)
    frame.Show()
    # threading.Thread(target=frame.timer())
    app.MainLoop()
