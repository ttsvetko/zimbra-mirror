
package zimbra.generated.mailclient.mail;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for byYearDayRule complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="byYearDayRule">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *       &lt;/sequence>
 *       &lt;attribute name="yrdaylist" use="required" type="{http://www.w3.org/2001/XMLSchema}string" />
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "byYearDayRule")
public class testByYearDayRule {

    @XmlAttribute(name = "yrdaylist", required = true)
    protected String yrdaylist;

    /**
     * Gets the value of the yrdaylist property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getYrdaylist() {
        return yrdaylist;
    }

    /**
     * Sets the value of the yrdaylist property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setYrdaylist(String value) {
        this.yrdaylist = value;
    }

}
