import configparser


class ConfigParser(configparser.ConfigParser):
    def __init__(self, defaults=None):
        configparser.ConfigParser.__init__(self, defaults=defaults)

    def optionxform(self, optionstr):
        return optionstr


def load_config(config_filepath):
    config = ConfigParser()
    config.read(config_filepath)
    return config


if __name__ == '__main__':
    config = ConfigParser()
    config.read('./config.ini')
    # HEADERS = {item[0]: item[1] for item in config.items("HEADERS")}
    VIDEO_SAVE_DIR = config["BASE"]["VIDEO_SAVE_DIR"]
    CHUNK_COUNT = int(config["BASE"]["CHUNK_COUNT"])
    FFMPEG_PATH = config["BASE"]["FFMPEG_PATH"]


